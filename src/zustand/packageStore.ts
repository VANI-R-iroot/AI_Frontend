import { create } from "zustand";
import { getSessionLimit } from "../utils/limitSession";

interface UserState {
  packageLimitData: any;
  packageData: (data: any) => void;
}

export const packageStore = create<UserState>((set, get) => ({
  packageLimitData: getSessionLimit() || {},
  packageData: (data: any) => {
    const merged = { ...get().packageLimitData, ...data };
    set({ packageLimitData: merged });
  },
}));
