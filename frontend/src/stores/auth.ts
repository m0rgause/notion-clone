import { defineStore } from "pinia";
import api from "@/service/axios";

interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false,
    loading: false,
  }),

  actions: {
    async register(email: string, password: string) {
      this.loading = true;
      try {
        const response = await api.post("/auth/register", { email, password });
        this.user = response.data.user;
        this.isAuthenticated = true;
        return response.data;
      } catch (error: any) {
        throw new Error(error.response?.data?.message || "Registration failed");
      } finally {
        this.loading = false;
      }
    },

    async login(email: string, password: string) {
      this.loading = true;
      try {
        const response = await api.post("/auth/login", { email, password });
        this.user = response.data.user;
        this.isAuthenticated = true;
        return response.data;
      } catch (error: any) {
        throw new Error(error.response?.data?.message || "Login failed");
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      this.loading = true;
      try {
        await api.post("/auth/logout");
        this.user = null;
        this.isAuthenticated = false;
      } catch (error: any) {
        throw new Error(error.response?.data?.message || "Logout failed");
      } finally {
        this.loading = false;
      }
    },

    async checkAuth() {
      this.loading = true;
      try {
        const response = await api.get("/auth/me");
        this.user = response.data;
        this.isAuthenticated = true;
        return response.data;
      } catch (error) {
        this.user = null;
        this.isAuthenticated = false;
      } finally {
        this.loading = false;
      }
    },
  },
  persist: true,
});
