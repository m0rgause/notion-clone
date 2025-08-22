import { defineStore } from "pinia";
import api from "@/service/axios";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
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
      try {
        const response = await api.get("/notes");
        this.notes = response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || "Failed to fetch notes";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchNote(id: string) {
      this.loading = true;
      try {
        const response = await api.get(`/notes/${id}`);
        this.currentNote = response.data;
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || "Failed to fetch note";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createNote(title: string) {
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
  },
});
