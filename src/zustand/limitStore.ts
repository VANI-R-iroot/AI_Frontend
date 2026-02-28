import { create } from "zustand";
import { getSessionLimit } from "../utils/limitSession";

interface UserState {
  limitData: any;
  setUserData: (data: any) => void;
}

export const limitStore = create<UserState>((set, get) => ({
  limitData: getSessionLimit() || {},
  setUserData: (data: any) => {
    const merged = { ...get().limitData, ...data };
    set({ limitData: merged });
  },
}));
