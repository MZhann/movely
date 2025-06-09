import { create } from "zustand";

interface AppState {
  isAuthenticated: boolean;
  user: any | null;
  setUser: (user: any | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  isAuthenticated: false,
  user: null,
  setUser: (user) => set({ user }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
}));
