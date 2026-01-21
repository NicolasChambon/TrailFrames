import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import api from "@/lib/api";
import type { User } from "@/types/auth";

interface AuthState {
  user: User | null;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;

  isAuthenticated: () => boolean;
}

// Flag to prevent multiple simultaneous auth checks
let isCheckingAuth = false;

export const useAuthStore = create<AuthState>()(
  devtools(
    // persist the auth state in localStorage
    persist(
      (set, get) => ({
        user: null,
        isLoading: false,

        isAuthenticated: () => {
          return get().user !== null;
        },

        setUser: (user: User | null) => {
          set({ user, isLoading: false });
        },

        logout: async () => {
          try {
            await api.post("/auth/logout");
          } catch (error) {
            console.error("Logout failed:", error);
          } finally {
            set({ user: null, isLoading: false });
            localStorage.removeItem("auth-storage");
            window.location.href = "/entry"; // TODO: Why note use navigate("/entry") ?
          }
        },

        // TODO: when to call this method?
        checkAuth: async () => {
          if (isCheckingAuth) return;

          isCheckingAuth = true;
          set({ isLoading: true });

          try {
            const response = await api.get("/auth/current-user");
            set({ user: response.data, isLoading: false });
            // TODO: resolve error type issue
          } catch (error) {
            set({ user: null, isLoading: false });
          } finally {
            isCheckingAuth = false;
          }
        },
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({ user: state.user }), // only persist the user object
      },
    ),
    {
      name: "AuthStore", // name displayed in Redux DevTools
    },
  ),
);
