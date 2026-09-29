import { create } from 'zustand';

export interface OperationalContextSelection {
  scopeId: number;
  type?: string;
  targetId?: string;
  code?: string;
  name?: string;
}

interface ShellUiState {
  sidebarCollapsed: boolean;
  operationalContext?: OperationalContextSelection;
  setOperationalContext: (context?: OperationalContextSelection) => void;
  toggleSidebar: () => void;
}

export const useShellUiStore = create<ShellUiState>((set) => ({
  sidebarCollapsed: false,
  operationalContext: undefined,
  setOperationalContext: (operationalContext) => set({ operationalContext }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
