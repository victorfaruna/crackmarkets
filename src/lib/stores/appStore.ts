import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

interface AppState {
  // Sidebar
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Global loading
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // Stock Trader connection state
  isConnectedToStockTrader: boolean;
  setIsConnectedToStockTrader: (connected: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Sidebar
      isSidebarOpen: false,
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      // Theme
      theme: "dark",
      setTheme: (theme) => set({ theme }),

      // Global loading
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),

      // Stock Trader connection state
      isConnectedToStockTrader: false,
      setIsConnectedToStockTrader: (connected) =>
        set({ isConnectedToStockTrader: connected }),
    }),
    {
      name: "crackmarkets-app-state",
      // Persist sidebar, theme, and broker/stock trader connection status
      partialize: (state) => ({
        isSidebarOpen: state.isSidebarOpen,
        theme: state.theme,
        isConnectedToStockTrader: state.isConnectedToStockTrader,
      }),
    },
  ),
);
