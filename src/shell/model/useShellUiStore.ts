import { create } from 'zustand';

interface ShellUiState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useShellUiStore = create<ShellUiState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
