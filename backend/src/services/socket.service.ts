import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { PrismaClient } from "../generated/prisma";
import jwt from "jsonwebtoken";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../types/socket.types";

const prisma = new PrismaClient();

interface User {
  id: string;
  email: string;
}

interface ActiveUser {
  userId: string;
  socketId: string;
  noteId: string;
}

class SocketService {
  private io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>;
  private activeUsers: ActiveUser[] = [];
  private static instance: SocketService;

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
      },
    });

    SocketService.instance = this;
    this.setupSocketHandlers();
  }

  static getInstance(): SocketService | null {
    return SocketService.instance;
  }

  // Method to emit events from controllers
  emitToNote(noteId: string, event: keyof ServerToClientEvents, data: any) {
    this.io.to(noteId).emit(event, data);
  }

  private setupSocketHandlers() {
    this.io.on("connection", async (socket: Socket) => {
      // Authenticate user using JWT from cookie
      const cookies = socket.handshake.headers.cookie
        ?.split(";")
        .map((cookie) => cookie.trim())
        .reduce((acc, cookie) => {
          const [key, value] = cookie.split("=");
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);

      const token = cookies?.token;

      if (!token) {
        console.error("No token found in cookies");
        socket.disconnect();
        return;
      }

      try {
        const user = jwt.verify(
          token,
          process.env.JWT_SECRET || "your-secret-key"
        ) as User;

        // Handle joining a note
        socket.on("join-note", (noteId: string) => {
          this.handleJoinNote(socket, user, noteId);
        });

        // Handle leaving a note
        socket.on("leave-note", (noteId: string) => {
          this.handleLeaveNote(socket, user, noteId);
        });

        // Handle block updates
        socket.on(
          "block-update",
          async (data: {
            noteId: string;
            blockId: string;
            content: string;
            type: string;
          }) => {
            await this.handleBlockUpdate(socket, user, data);
          }
        );

        // Handle block creation
        socket.on(
          "block-create",
          async (data: {
            noteId: string;
            type: string;
            content: string;
            parentId?: string;
          }) => {
            await this.handleBlockCreate(socket, user, data);
          }
        );

        // Handle block deletion
        socket.on(
          "block-delete",
          async (data: { noteId: string; blockId: string }) => {
            await this.handleBlockDelete(socket, user, data);
          }
        );

        // Handle block reordering
        socket.on(
          "blocks-reorder",
          async (data: {
            noteId: string;
            blocks: { id: string; orderIndex: number }[];
          }) => {
            await this.handleBlocksReorder(socket, user, data);
          }
        );

        // Handle disconnection
        socket.on("disconnect", () => {
          this.handleDisconnect(socket, user);
        });
      } catch (error) {
        console.error("Socket authentication error:", error);
        socket.disconnect();
      }
    });
  }

  private async handleJoinNote(socket: Socket, user: User, noteId: string) {
    try {
      // Verify user has access to the note (owner or collaborator)
      const note = await prisma.note.findFirst({
        where: {
          OR: [
            { id: noteId, userId: user.id }, // User owns the note
            {
              id: noteId,
              collaborators: {
                some: {
                  userId: user.id,
                },
              },
            }, // User is a collaborator
          ],
        },
      });

      if (!note) {
        socket.emit("error", { message: "Note access denied" });
        return;
      }

      // Add user to the note's room
      socket.join(noteId);

      // Add to active users
      this.activeUsers.push({
        userId: user.id,
        socketId: socket.id,
        noteId,
      });

      // Notify others that user joined
      socket.to(noteId).emit("user-joined", {
        userId: user.id,
        timestamp: new Date(),
      });

      // Send current active users in the note
      const noteActiveUsers = this.activeUsers.filter(
        (u) => u.noteId === noteId
      );
      socket.emit("active-users", noteActiveUsers);
    } catch (error) {
      console.error("Join note error:", error);
      socket.emit("error", { message: "Failed to join note" });
    }
  }

  private handleLeaveNote(socket: Socket, user: User, noteId: string) {
    socket.leave(noteId);
    this.activeUsers = this.activeUsers.filter((u) => u.socketId !== socket.id);

    // Notify others that user left
    socket.to(noteId).emit("user-left", {
      userId: user.id,
      timestamp: new Date(),
    });
  }

  private async handleBlockUpdate(
    socket: Socket,
    user: User,
    data: { noteId: string; blockId: string; content: string; type: string }
  ) {
    try {
      // Verify user has edit access to the note (owner or collaborator with edit permission)
      const note = await prisma.note.findFirst({
        where: {
          OR: [
            { id: data.noteId, userId: user.id }, // User owns the note
            {
              id: data.noteId,
              collaborators: {
                some: {
                  userId: user.id,
                  permission: "EDIT", // Only collaborators with edit permission
                },
              },
            },
          ],
        },
      });

      if (!note) {
        socket.emit("error", {
          message: "Note access denied or no edit permission",
        });
        return;
      }

      // Update the block
      const updatedBlock = await prisma.block.update({
        where: { id: data.blockId },
        data: {
          content: data.content,
          type: data.type as any,
        },
      });

      // Broadcast the update to others in the note
      socket.to(data.noteId).emit("block-updated", {
        blockId: data.blockId,
        content: data.content,
        type: data.type,
        updatedBy: user.id,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Block update error:", error);
      socket.emit("error", { message: "Failed to update block" });
    }
  }

  private async handleBlocksReorder(
    socket: Socket,
    user: User,
    data: { noteId: string; blocks: { id: string; orderIndex: number }[] }
  ) {
    try {
      // Verify user has access to the note
      const note = await prisma.note.findFirst({
        where: {
          id: data.noteId,
          userId: user.id,
        },
      });

      if (!note) {
        socket.emit("error", { message: "Note access denied" });
        return;
      }

      // Update all blocks in a transaction
      await prisma.$transaction(
        data.blocks.map((block) =>
          prisma.block.update({
            where: { id: block.id },
            data: { orderIndex: block.orderIndex },
          })
        )
      );

      // Broadcast the reorder to others in the note
      socket.to(data.noteId).emit("blocks-reordered", {
        blocks: data.blocks,
        updatedBy: user.id,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Blocks reorder error:", error);
      socket.emit("error", { message: "Failed to reorder blocks" });
    }
  }

  private async handleBlockCreate(
    socket: Socket,
    user: User,
    data: { noteId: string; type: string; content: string; parentId?: string }
  ) {
    try {
      // Verify user has edit access to the note
      const note = await prisma.note.findFirst({
        where: {
          OR: [
            { id: data.noteId, userId: user.id }, // User owns the note
            {
              id: data.noteId,
              collaborators: {
                some: {
                  userId: user.id,
                  permission: "EDIT", // Only collaborators with edit permission
                },
              },
            },
          ],
        },
      });

      if (!note) {
        socket.emit("error", {
          message: "Note access denied or no edit permission",
        });
        return;
      }

      // Get the highest order index
      const lastBlock = await prisma.block.findFirst({
        where: { noteId: data.noteId },
        orderBy: { orderIndex: "desc" },
      });

      const newOrderIndex = lastBlock ? lastBlock.orderIndex + 1 : 0;

      // Create the block
      const newBlock = await prisma.block.create({
        data: {
          type: data.type as any,
          content: data.content,
          noteId: data.noteId,
          parentId: data.parentId,
          orderIndex: newOrderIndex,
        },
      });

      // Update note's updatedAt timestamp
      await prisma.note.update({
        where: { id: data.noteId },
        data: { updatedAt: new Date() },
      });

      // Broadcast the new block to others in the note
      socket.to(data.noteId).emit("block-created", {
        block: newBlock,
        createdBy: user.id,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Block create error:", error);
      socket.emit("error", { message: "Failed to create block" });
    }
  }

  private async handleBlockDelete(
    socket: Socket,
    user: User,
    data: { noteId: string; blockId: string }
  ) {
    try {
      // Verify user has edit access to the note
      const note = await prisma.note.findFirst({
        where: {
          OR: [
            { id: data.noteId, userId: user.id }, // User owns the note
            {
              id: data.noteId,
              collaborators: {
                some: {
                  userId: user.id,
                  permission: "EDIT", // Only collaborators with edit permission
                },
              },
            },
          ],
        },
      });

      if (!note) {
        socket.emit("error", {
          message: "Note access denied or no edit permission",
        });
        return;
      }

      // Delete the block
      await prisma.block.delete({
        where: { id: data.blockId },
      });

      // Update note's updatedAt timestamp
      await prisma.note.update({
        where: { id: data.noteId },
        data: { updatedAt: new Date() },
      });

      // Broadcast the deletion to others in the note
      socket.to(data.noteId).emit("block-deleted", {
        blockId: data.blockId,
        deletedBy: user.id,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Block delete error:", error);
      socket.emit("error", { message: "Failed to delete block" });
    }
  }

  private handleDisconnect(socket: Socket, user: User) {
    const activeUser = this.activeUsers.find((u) => u.socketId === socket.id);
    if (activeUser) {
      // Notify others in the note that user disconnected
      socket.to(activeUser.noteId).emit("user-left", {
        userId: user.id,
        timestamp: new Date(),
      });
    }

    // Remove user from active users
    this.activeUsers = this.activeUsers.filter((u) => u.socketId !== socket.id);
  }
}

export default SocketService;
