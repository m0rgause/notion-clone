// src/types/socket.types.ts
export interface ServerToClientEvents {
  "block-updated": (data: {
    blockId: string;
    type: string;
    content: string;
    updatedBy: string;
    timestamp: Date;
  }) => void;
  "block-created": (data: {
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
  }) => void;
  "block-deleted": (data: {
    blockId: string;
    deletedBy: string;
    timestamp: Date;
  }) => void;
  "blocks-reordered": (data: {
    blocks: { id: string; orderIndex: number }[];
    updatedBy: string;
    timestamp: Date;
  }) => void;
  "user-joined": (data: { userId: string; timestamp: Date }) => void;
  "user-left": (data: { userId: string; timestamp: Date }) => void;
  "active-users": (
    users: { userId: string; socketId: string; noteId: string }[]
  ) => void;
  error: (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  "join-note": (noteId: string) => void;
  "leave-note": (noteId: string) => void;
  "block-update": (data: {
    noteId: string;
    blockId: string;
    type: string;
    content: string;
  }) => void;
  "blocks-reorder": (data: {
    noteId: string;
    blocks: { id: string; orderIndex: number }[];
  }) => void;
}
