import { create } from "zustand";
import { getSessionUser } from "../utils/userSession";

interface UserState {
  apiUseAiCodeGenerateLimit: number;
  userData: any;
  setUserData: (data: any) => void;
}

export const useUserStore = create<UserState>((set, get) => {
  const sessionUser = getSessionUser() || {};

  return {
    apiUseAiCodeGenerateLimit: sessionUser.apiUseAiCodeGenerateLimit || 0,
    userData: sessionUser,
    setUserData: (data: any) => {
      const merged = { ...get().userData, ...data };
      set({
        userData: merged,
        apiUseAiCodeGenerateLimit: data.apiUseAiCodeGenerateLimit ?? get().apiUseAiCodeGenerateLimit,
      });
    },
  };
});

