import { create } from "zustand";

export const useStore = create((set) => ({
  user: {},
  setUser: (user) => set({ user }),
}));
