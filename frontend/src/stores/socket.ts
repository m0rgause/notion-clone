import { defineStore } from "pinia";
import { io, Socket } from "socket.io-client";

interface BlockUpdateData {
  blockId: string;
  content: string;
  type: string;
  updatedBy: string;
  timestamp: Date;
}

interface BlockCreateData {
  block: {
    id: string;
    type: string;
    content: string;
    noteId: string;
    parentId?: string;
    orderIndex: number;
    createdAt: string;
    updatedAt: string;
  };
  createdBy: string;
  timestamp: Date;
}

interface BlockDeleteData {
  blockId: string;
  deletedBy: string;
  timestamp: Date;
}

interface BlocksReorderData {
  blocks: { id: string; orderIndex: number }[];
  updatedBy: string;
  timestamp: Date;
}

interface UserActivityData {
  userId: string;
  timestamp: Date;
}

interface SocketState {
  socket: Socket | null;
  connected: boolean;
  activeUsers: string[];
}

interface CollaboratorUpdateData {
  noteId: string;
  collaborator: {
    id: string;
    email: string;
    permission: "view" | "comment" | "edit";
  };
  action: "added" | "removed" | "updated";
  updatedBy: string;
  timestamp: Date;
}

export const useSocketStore = defineStore("socket", {
  state: (): SocketState => ({
    socket: null,
    connected: false,
    activeUsers: [],
  }),

  actions: {
    connect() {
      console.log(
        "Connecting to socket...",
        import.meta.env.VITE_SOCKET_URL,
        "Status",
        this.connected
      );
      if (!this.socket) {
        this.socket = io(import.meta.env.VITE_SOCKET_URL, {
          withCredentials: true,
          autoConnect: true,
        });

        this.socket.on("connect", () => {
          this.connected = true;
          console.log("Socket connected");
        });

        this.socket.on("disconnect", () => {
          this.connected = false;
          console.log("Socket disconnected");
        });

        this.socket.on("error", (error: { message: string }) => {
          console.error("Socket error:", error.message);
        });

        this.socket.on("active-users", (users: any[]) => {
          this.activeUsers = users.map((u) => u.userId);
        });

        this.socket.on("user-joined", (data: UserActivityData) => {
          if (!this.activeUsers.includes(data.userId)) {
            this.activeUsers.push(data.userId);
          }
        });

        this.socket.on("user-left", (data: UserActivityData) => {
          this.activeUsers = this.activeUsers.filter(
            (id) => id !== data.userId
          );
        });
      }
      // checking socket connection status
    },

    disconnect() {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
        this.connected = false;
        this.activeUsers = [];
      }
    },

    joinNote(noteId: string) {
      if (this.socket) {
        this.socket.emit("join-note", noteId);
      }
    },

    leaveNote(noteId: string) {
      if (this.socket) {
        this.socket.emit("leave-note", noteId);
      }
    },

    emitBlockUpdate(data: {
      noteId: string;
      blockId: string;
      content: string;
      type: string;
    }) {
      if (this.socket) {
        this.socket.emit("block-update", data);
      }
    },

    emitBlocksReorder(data: {
      noteId: string;
      blocks: { id: string; orderIndex: number }[];
    }) {
      if (this.socket) {
        this.socket.emit("blocks-reorder", data);
      }
    },

    emitBlockCreate(data: {
      noteId: string;
      type: string;
      content: string;
      parentId?: string;
    }) {
      if (this.socket) {
        this.socket.emit("block-create", data);
      }
    },

    emitBlockDelete(data: { noteId: string; blockId: string }) {
      if (this.socket) {
        this.socket.emit("block-delete", data);
      }
    },

    onBlockUpdated(callback: (data: BlockUpdateData) => void) {
      if (this.socket) {
        this.socket.on("block-updated", callback);
      }
    },

    onBlocksReordered(callback: (data: BlocksReorderData) => void) {
      if (this.socket) {
        this.socket.on("blocks-reordered", callback);
      }
    },

    onBlockCreated(callback: (data: BlockCreateData) => void) {
      if (this.socket) {
        this.socket.on("block-created", callback);
      }
    },

    onBlockDeleted(callback: (data: BlockDeleteData) => void) {
      if (this.socket) {
        this.socket.on("block-deleted", callback);
      }
    },

    offBlockUpdated(callback?: (data: BlockUpdateData) => void) {
      if (this.socket) {
        this.socket.off("block-updated", callback);
      }
    },

    offBlocksReordered(callback?: (data: BlocksReorderData) => void) {
      if (this.socket) {
        this.socket.off("blocks-reordered", callback);
      }
    },

    offBlockCreated(callback?: (data: BlockCreateData) => void) {
      if (this.socket) {
        this.socket.off("block-created", callback);
      }
    },

    offBlockDeleted(callback?: (data: BlockDeleteData) => void) {
      if (this.socket) {
        this.socket.off("block-deleted", callback);
      }
    },

    // Collaboration methods
    emitCollaboratorAdded(data: {
      noteId: string;
      email: string;
      permission: "view" | "comment" | "edit";
    }) {
      if (this.socket) {
        this.socket.emit("collaborator-added", data);
      }
    },

    emitCollaboratorRemoved(data: { noteId: string; collaboratorId: string }) {
      if (this.socket) {
        this.socket.emit("collaborator-removed", data);
      }
    },

    emitPublicStatusToggled(data: { noteId: string; isPublic: boolean }) {
      if (this.socket) {
        this.socket.emit("public-status-toggled", data);
      }
    },

    onCollaboratorUpdated(callback: (data: CollaboratorUpdateData) => void) {
      if (this.socket) {
        this.socket.on("collaborator-updated", callback);
      }
    },

    onPublicStatusChanged(
      callback: (data: {
        noteId: string;
        isPublic: boolean;
        updatedBy: string;
        timestamp: Date;
      }) => void
    ) {
      if (this.socket) {
        this.socket.on("public-status-changed", callback);
      }
    },

    offCollaboratorUpdated(callback?: (data: CollaboratorUpdateData) => void) {
      if (this.socket) {
        this.socket.off("collaborator-updated", callback);
      }
    },

    offPublicStatusChanged(callback?: (data: any) => void) {
      if (this.socket) {
        this.socket.off("public-status-changed", callback);
      }
    },
  },
  persist: true,
});
