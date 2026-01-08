import { create } from "zustand";

export const useStore = create((set) => ({
  user: {},
  settings: [],
  setUser: (user) => set({ user }),
  setSettings: (settings) => set({ settings }),
}));
