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

  // RoboForex connection state
  isConnectedToRoboForex: boolean;
  setIsConnectedToRoboForex: (connected: boolean) => void;
  // Backward-compatible alias
  isConnectedToStockTrader: boolean;
  setIsConnectedToStockTrader: (connected: boolean) => void;

  // Wallet / Withdrawal Drawer state
  isWalletDrawerOpen: boolean;
  setWalletDrawerOpen: (open: boolean) => void;
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

      // RoboForex connection state
      isConnectedToRoboForex: false,
      setIsConnectedToRoboForex: (connected) =>
        set({ isConnectedToRoboForex: connected, isConnectedToStockTrader: connected }),
      isConnectedToStockTrader: false,
      setIsConnectedToStockTrader: (connected) =>
        set({ isConnectedToRoboForex: connected, isConnectedToStockTrader: connected }),

      // Wallet drawer
      isWalletDrawerOpen: false,
      setWalletDrawerOpen: (open) => set({ isWalletDrawerOpen: open }),
    }),
    {
      name: "trackmarkets-app-state",
      // Persist sidebar, theme, and broker/RoboForex connection status
      partialize: (state) => ({
        isSidebarOpen: state.isSidebarOpen,
        theme: state.theme,
        isConnectedToRoboForex: state.isConnectedToRoboForex,
        isConnectedToStockTrader: state.isConnectedToRoboForex,
      }),
    },
  ),
);
