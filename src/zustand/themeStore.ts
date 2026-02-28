
import { create } from "zustand";

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDarkMode: true,
  toggleTheme: () =>
    set((state) => ({
      isDarkMode: !state.isDarkMode,
    })),
}));
