import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import SocketService from "../services/socket.service";

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const createNote = async (req: AuthRequest, res: Response) => {
  try {
    const { title } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const note = await prisma.note.create({
      data: {
        title,
        userId,
      },
      include: {
        blocks: true,
      },
    });

    res.status(201).json(note);
  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getNotes = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Get notes where user is owner OR collaborator
    const notes = await prisma.note.findMany({
      where: {
        OR: [
          { userId }, // User owns the note
          {
            collaborators: {
              some: {
                userId,
              },
            },
          }, // User is a collaborator
        ],
      },
      include: {
        blocks: {
          orderBy: {
            orderIndex: "asc",
          },
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Format notes for frontend
    const formattedNotes = notes.map((note) => ({
      ...note,
      collaborators: note.collaborators.map((collab) => ({
        id: collab.id,
        email: collab.user.email,
        permission: collab.permission.toLowerCase(),
        name: collab.user.email.split("@")[0],
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          collab.user.email
        )}&background=3b82f6&color=white`,
      })),
    }));

    res.json(formattedNotes);
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getNote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Check if user owns the note or is a collaborator
    const note = await prisma.note.findFirst({
      where: {
        OR: [
          { id, userId }, // User owns the note
          {
            id,
            collaborators: {
              some: {
                userId,
              },
            },
          }, // User is a collaborator
        ],
      },
      include: {
        blocks: {
          orderBy: {
            orderIndex: "asc",
          },
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Format collaborators for frontend
    const formattedNote = {
      ...note,
      collaborators: note.collaborators.map((collab) => ({
        id: collab.id,
        email: collab.user.email,
        permission: collab.permission.toLowerCase(),
        name: collab.user.email.split("@")[0],
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          collab.user.email
        )}&background=3b82f6&color=white`,
      })),
    };

    res.json(formattedNote);
  } catch (error) {
    console.error("Get note error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateNote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const userId = req.user?.id;

    // Check if user owns the note or has edit permission as collaborator
    const note = await prisma.note.findFirst({
      where: {
        OR: [
          { id, userId }, // User owns the note
          {
            id,
            collaborators: {
              some: {
                userId,
                permission: "EDIT", // Only collaborators with edit permission
              },
            },
          },
        ],
      },
      include: {
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!note) {
      return res
        .status(404)
        .json({ message: "Note not found or no edit permission" });
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data: { title },
      include: {
        blocks: {
          orderBy: {
            orderIndex: "asc",
          },
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Format collaborators for frontend
    const formattedNote = {
      ...updatedNote,
      collaborators: updatedNote.collaborators.map((collab) => ({
        id: collab.id,
        email: collab.user.email,
        permission: collab.permission.toLowerCase(),
        name: collab.user.email.split("@")[0],
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          collab.user.email
        )}&background=3b82f6&color=white`,
      })),
    };

    res.json(formattedNote);
  } catch (error) {
    console.error("Update note error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteNote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const note = await prisma.note.findFirst({
      where: {
        id,
        userId: req.user?.id,
      },
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    await prisma.note.delete({
      where: { id },
    });

    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createBlock = async (req: AuthRequest, res: Response) => {
  try {
    const { noteId } = req.params;
    const { type, content, parentId } = req.body;
    const userId = req.user?.id;

    // Check if user owns the note or has edit permission as collaborator
    const note = await prisma.note.findFirst({
      where: {
        OR: [
          { id: noteId, userId }, // User owns the note
          {
            id: noteId,
            collaborators: {
              some: {
                userId,
                permission: "EDIT", // Only collaborators with edit permission
              },
            },
          },
        ],
      },
    });

    if (!note) {
      return res
        .status(404)
        .json({ message: "Note not found or no edit permission" });
    }

    // Get the highest order index
    const lastBlock = await prisma.block.findFirst({
      where: { noteId },
      orderBy: { orderIndex: "desc" },
    });

    const newOrderIndex = lastBlock ? lastBlock.orderIndex + 1 : 0;

    const block = await prisma.block.create({
      data: {
        type,
        content,
        noteId,
        parentId,
        orderIndex: newOrderIndex,
      },
    });

    // Emit socket event for real-time collaboration
    const socketService = SocketService.getInstance();
    if (socketService) {
      console.log(
        `Emitting block-created event for noteId: ${noteId}, blockId: ${block.id}`
      );
      socketService.emitToNote(noteId, "block-created", {
        block: {
          id: block.id,
          type: block.type,
          content: block.content,
          noteId: block.noteId,
          parentId: block.parentId,
          orderIndex: block.orderIndex,
          createdAt: block.createdAt.toISOString(),
          updatedAt: block.updatedAt.toISOString(),
        },
        createdBy: userId,
        timestamp: new Date(),
      });
    } else {
      console.log("SocketService instance not found!");
    }

    res.status(201).json(block);
  } catch (error) {
    console.error("Create block error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateBlock = async (req: AuthRequest, res: Response) => {
  try {
    const { noteId, blockId } = req.params;
    const { content, type } = req.body;
    const userId = req.user?.id;

    // Check if user owns the note or has edit permission as collaborator
    const note = await prisma.note.findFirst({
      where: {
        OR: [
          { id: noteId, userId }, // User owns the note
          {
            id: noteId,
            collaborators: {
              some: {
                userId,
                permission: "EDIT", // Only collaborators with edit permission
              },
            },
          },
        ],
      },
    });

    if (!note) {
      return res
        .status(404)
        .json({ message: "Note not found or no edit permission" });
    }

    const block = await prisma.block.findFirst({
      where: {
        id: blockId,
        noteId,
      },
    });

    if (!block) {
      return res.status(404).json({ message: "Block not found" });
    }

    const updateData: any = {};
    if (content !== undefined) updateData.content = content;
    if (type !== undefined) updateData.type = type;

    const updatedBlock = await prisma.block.update({
      where: { id: blockId },
      data: updateData,
    });

    // Also update the note's updatedAt timestamp
    await prisma.note.update({
      where: { id: noteId },
      data: { updatedAt: new Date() },
    });

    res.json(updatedBlock);
  } catch (error) {
    console.error("Update block error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteBlock = async (req: AuthRequest, res: Response) => {
  try {
    const { noteId, blockId } = req.params;
    const userId = req.user?.id;

    // Check if user owns the note or has edit permission as collaborator
    const note = await prisma.note.findFirst({
      where: {
        OR: [
          { id: noteId, userId }, // User owns the note
          {
            id: noteId,
            collaborators: {
              some: {
                userId,
                permission: "EDIT", // Only collaborators with edit permission
              },
            },
          },
        ],
      },
    });

    if (!note) {
      return res
        .status(404)
        .json({ message: "Note not found or no edit permission" });
    }

    const block = await prisma.block.findFirst({
      where: {
        id: blockId,
        noteId,
      },
    });

    if (!block) {
      return res.status(404).json({ message: "Block not found" });
    }

    await prisma.block.delete({
      where: { id: blockId },
    });

    // Emit socket event for real-time collaboration
    const socketService = SocketService.getInstance();
    if (socketService) {
      console.log(
        `Emitting block-deleted event for noteId: ${noteId}, blockId: ${blockId}`
      );
      socketService.emitToNote(noteId, "block-deleted", {
        blockId,
        deletedBy: userId,
        timestamp: new Date(),
      });
    } else {
      console.log("SocketService instance not found!");
    }

    res.json({ message: "Block deleted successfully" });
  } catch (error) {
    console.error("Delete block error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const reorderBlocks = async (req: AuthRequest, res: Response) => {
  try {
    const { noteId } = req.params;
    const { blocks } = req.body as {
      blocks: { id: string; orderIndex: number }[];
    };

    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId: req.user?.id,
      },
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Update all blocks in a transaction
    await prisma.$transaction(
      blocks.map((block) =>
        prisma.block.update({
          where: { id: block.id },
          data: { orderIndex: block.orderIndex },
        })
      )
    );

    // Update note's updatedAt timestamp
    await prisma.note.update({
      where: { id: noteId },
      data: { updatedAt: new Date() },
    });

    const updatedBlocks = await prisma.block.findMany({
      where: { noteId },
      orderBy: { orderIndex: "asc" },
    });

    res.json(updatedBlocks);
  } catch (error) {
    console.error("Reorder blocks error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const bulkUpdateBlocks = async (req: AuthRequest, res: Response) => {
  try {
    const { noteId } = req.params;
    const { blocks } = req.body as {
      blocks: {
        id: string;
        content?: string;
        type?: string;
        orderIndex?: number;
      }[];
    };

    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId: req.user?.id,
      },
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Update all blocks in a transaction
    await prisma.$transaction([
      ...blocks.map((block) => {
        const updateData: any = {};
        if (block.content !== undefined) updateData.content = block.content;
        if (block.type !== undefined) updateData.type = block.type;
        if (block.orderIndex !== undefined)
          updateData.orderIndex = block.orderIndex;

        return prisma.block.update({
          where: { id: block.id },
          data: updateData,
        });
      }),
      // Update note's updatedAt timestamp
      prisma.note.update({
        where: { id: noteId },
        data: { updatedAt: new Date() },
      }),
    ]);

    const updatedBlocks = await prisma.block.findMany({
      where: { noteId },
      orderBy: { orderIndex: "asc" },
    });

    res.json(updatedBlocks);
  } catch (error) {
    console.error("Bulk update blocks error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
