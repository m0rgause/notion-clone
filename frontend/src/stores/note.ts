import { defineStore } from "pinia";
import api from "@/service/axios";
import { useSocketStore } from "./socket";

interface Block {
  id: string;
  type: "TEXT" | "CHECKLIST" | "IMAGE" | "CODE";
  content: string;
  orderIndex: number;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Note {
  id: string;
  title: string;
  blocks: Block[];
  collaborators?: Collaborator[];
  isPublic?: boolean;
  publicId?: string;
  createdAt: string;
  updatedAt: string;
}

interface Collaborator {
  id: string;
  email: string;
  name: string;
  permission: "view" | "comment" | "edit";
  avatar?: string;
}

interface NoteState {
  notes: Note[];
  currentNote: Note | null;
  loading: boolean;
  error: string | null;
}

export const useNoteStore = defineStore("note", {
  state: (): NoteState => ({
    notes: [],
    currentNote: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchNotes() {
      this.loading = true;
      this.error = null; // Clear previous errors
      try {
        const response = await api.get("/notes");

        // Preserve local collaboration data when updating notes
        this.notes = response.data.map((fetchedNote: Note) => {
          const existingNote = this.notes.find((n) => n.id === fetchedNote.id);
          return {
            ...fetchedNote,
            collaborators: existingNote?.collaborators || [],
            isPublic: existingNote?.isPublic || false,
          };
        });
      } catch (error: any) {
        this.error = error.response?.data?.message || "Failed to fetch notes";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchNote(id: string) {
      this.loading = true;
      this.error = null; // Clear previous errors
      try {
        const response = await api.get(`/notes/${id}`);

        // Preserve local collaboration data if it exists
        const existingNote =
          this.currentNote?.id === id
            ? this.currentNote
            : this.notes.find((n) => n.id === id);
        const collaborators = existingNote?.collaborators || [];
        const isPublic = existingNote?.isPublic || false;

        // Merge backend data with local collaboration data
        this.currentNote = {
          ...response.data,
          collaborators,
          isPublic,
        };

        // Also update the note in the notes array
        const noteIndex = this.notes.findIndex((note) => note.id === id);
        if (noteIndex !== -1) {
          this.notes[noteIndex] = {
            ...this.notes[noteIndex],
            ...response.data,
            collaborators,
            isPublic,
          };
        }
        return this.currentNote;
      } catch (error: any) {
        this.error = error.response?.data?.message || "Failed to fetch note";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createNote(title: string) {
      this.error = null; // Clear previous errors
      try {
        const response = await api.post("/notes", { title, content: "" });
        this.notes.push(response.data);
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || "Failed to create note";
        throw error;
      }
    },

    async updateNote(id: string, data: { title?: string; content?: string }) {
      this.error = null; // Clear previous errors
      try {
        const response = await api.put(`/notes/${id}`, data);
        const index = this.notes.findIndex((note) => note.id === id);
        if (index !== -1) {
          this.notes[index] = response.data;
        }
        if (this.currentNote?.id === id) {
          this.currentNote = response.data;
        }
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || "Failed to update note";
        throw error;
      }
    },

    async deleteNote(id: string) {
      try {
        await api.delete(`/notes/${id}`);
        this.notes = this.notes.filter((note) => note.id !== id);
        if (this.currentNote?.id === id) {
          this.currentNote = null;
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || "Failed to delete note";
        throw error;
      }
    },

    async createBlock(
      noteId: string,
      block: Omit<Block, "id" | "createdAt" | "updatedAt">
    ) {
      this.error = null; // Clear previous errors
      try {
        const response = await api.post(`/notes/${noteId}/blocks`, block);

        // Don't update local state here - let socket events handle all updates
        // This prevents duplication between API response and socket events

        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || "Failed to create block";
        throw error;
      }
    },

    async updateBlock(noteId: string, blockId: string, content: string) {
      try {
        const response = await api.put(`/notes/${noteId}/blocks/${blockId}`, {
          content,
        });

        // Don't update local state here - let socket events handle all updates
        // This prevents duplication between API response and socket events

        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || "Failed to update block";
        throw error;
      }
    },

    async bulkUpdateBlocks(
      noteId: string,
      blocks: {
        id: string;
        content?: string;
        type?: string;
        orderIndex?: number;
      }[]
    ) {
      try {
        const response = await api.put(`/notes/${noteId}/blocks/bulk-update`, {
          blocks,
        });
        const noteIndex = this.notes.findIndex((note) => note.id === noteId);
        if (noteIndex !== -1) {
          this.notes[noteIndex].blocks = response.data;
        }
        if (this.currentNote?.id === noteId) {
          this.currentNote.blocks = response.data;
        }
        return response.data;
      } catch (error: any) {
        this.error =
          error.response?.data?.message || "Failed to bulk update blocks";
        throw error;
      }
    },

    async reorderBlocks(
      noteId: string,
      blocks: { id: string; orderIndex: number }[]
    ) {
      try {
        const response = await api.put(`/notes/${noteId}/blocks/reorder`, {
          blocks,
        });
        const index = this.notes.findIndex((note) => note.id === noteId);
        if (index !== -1) {
          this.notes[index].blocks = response.data;
        }
        if (this.currentNote?.id === noteId) {
          this.currentNote.blocks = response.data;
        }
        return response.data;
      } catch (error: any) {
        this.error =
          error.response?.data?.message || "Failed to reorder blocks";
        throw error;
      }
    },

    async deleteBlock(noteId: string, blockId: string) {
      this.error = null; // Clear previous errors
      try {
        await api.delete(`/notes/${noteId}/blocks/${blockId}`);

        // Don't update local state here - let socket events handle all updates
        // This prevents duplication between API response and socket events
      } catch (error: any) {
        this.error = error.response?.data?.message || "Failed to delete block";
        throw error;
      }
    },

    // Collaborator management methods
    async addCollaborator(
      noteId: string,
      email: string,
      permission: "view" | "comment" | "edit"
    ) {
      this.error = null; // Clear previous errors
      try {
        const response = await api.post(`/notes/${noteId}/collaborators`, {
          email,
          permission,
        });
        const newCollaborator = response.data;

        // Update current note if it matches
        if (this.currentNote?.id === noteId) {
          if (!this.currentNote.collaborators) {
            this.currentNote.collaborators = [];
          }
          this.currentNote.collaborators.push(newCollaborator);
        }

        // Update notes array
        const noteIndex = this.notes.findIndex((note) => note.id === noteId);
        if (noteIndex !== -1) {
          if (!this.notes[noteIndex].collaborators) {
            this.notes[noteIndex].collaborators = [];
          }
          this.notes[noteIndex].collaborators.push(newCollaborator);
        }

        // Emit socket event for real-time updates
        const socketStore = useSocketStore();
        socketStore.emitCollaboratorAdded({ noteId, email, permission });

        return newCollaborator;
      } catch (error: any) {
        this.error =
          error.response?.data?.message || "Failed to add collaborator";
        throw error;
      }
    },

    async removeCollaborator(noteId: string, collaboratorId: string) {
      this.error = null; // Clear previous errors
      try {
        await api.delete(`/notes/${noteId}/collaborators/${collaboratorId}`);

        // Update current note if it matches
        if (this.currentNote?.id === noteId && this.currentNote.collaborators) {
          this.currentNote.collaborators =
            this.currentNote.collaborators.filter(
              (c) => c.id !== collaboratorId
            );
        }

        // Update notes array
        const noteIndex = this.notes.findIndex((note) => note.id === noteId);
        if (noteIndex !== -1 && this.notes[noteIndex].collaborators) {
          this.notes[noteIndex].collaborators = this.notes[
            noteIndex
          ].collaborators.filter((c) => c.id !== collaboratorId);
        }

        // Emit socket event for real-time updates
        const socketStore = useSocketStore();
        socketStore.emitCollaboratorRemoved({ noteId, collaboratorId });
      } catch (error: any) {
        this.error =
          error.response?.data?.message || "Failed to remove collaborator";
        throw error;
      }
    },

    async updateNotePublicStatus(noteId: string, isPublic: boolean) {
      this.error = null; // Clear previous errors
      try {
        const response = await api.patch(`/notes/${noteId}/public`, {
          isPublic,
        });
        const updatedNote = response.data;

        // Update current note if it matches
        if (this.currentNote?.id === noteId) {
          this.currentNote.isPublic = updatedNote.isPublic;
          this.currentNote.publicId = updatedNote.publicId;
        }

        // Update notes array
        const noteIndex = this.notes.findIndex((note) => note.id === noteId);
        if (noteIndex !== -1) {
          this.notes[noteIndex].isPublic = updatedNote.isPublic;
          this.notes[noteIndex].publicId = updatedNote.publicId;
        }

        // Emit socket event for real-time updates
        const socketStore = useSocketStore();
        socketStore.emitPublicStatusToggled({
          noteId,
          isPublic: updatedNote.isPublic,
        });

        return updatedNote;
      } catch (error: any) {
        this.error =
          error.response?.data?.message || "Failed to update public status";
        throw error;
      }
    },

    async getPublicNote(publicId: string) {
      try {
        this.loading = true;
        this.error = null; // Clear previous errors
        const response = await api.get(`/public/notes/${publicId}`);
        return response.data;
      } catch (error: any) {
        this.error =
          error.response?.data?.message || "Failed to fetch public note";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Helper method to clear errors manually
    clearError() {
      this.error = null;
    },
  },
  persist: true,
});
