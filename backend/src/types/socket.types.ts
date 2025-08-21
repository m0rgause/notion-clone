// src/types/socket.types.ts
export interface ServerToClientEvents {
  "block-updated": (data: {
    blockId: string;
    type: string;
    content: string;
    updatedBy: string;
  }) => void;
  "blocks-reordered": (data: {
    blocks: { id: string; orderIndex: number }[];
    updatedBy: string;
  }) => void;
  "user-joined": (data: { userId: string; email: string }) => void;
  "user-left": (data: { userId: string; email: string }) => void;
  "active-users": (userIds: string[]) => void;
  error: (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  authenticate: (token: string) => void;
  "join-note": (noteId: string) => void;
  "leave-note": (noteId: string) => void;
  "block-update": (data: {
    noteId: string;
    blockId: string;
    type: string;
    content: string;
  }) => void;
  "block-reorder": (data: {
    noteId: string;
    blocks: { id: string; orderIndex: number }[];
  }) => void;
}
