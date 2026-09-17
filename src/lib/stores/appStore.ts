import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  APP_STORE_STORAGE_KEY,
  applyAppTheme,
  DEFAULT_APP_THEME,
  isAppTheme,
  type AppTheme,
} from "../theme";

interface AppState {
  // Sidebar
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Theme
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;

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
      theme: DEFAULT_APP_THEME,
      setTheme: (theme) => {
        applyAppTheme(theme);
        set({ theme });
      },

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
      name: APP_STORE_STORAGE_KEY,
      // Persist UI preferences only. Broker state is hydrated from the server.
      partialize: (state) => ({
        isSidebarOpen: state.isSidebarOpen,
        theme: state.theme,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<AppState>;
        return {
          ...currentState,
          ...persisted,
          theme: isAppTheme(persisted.theme)
            ? persisted.theme
            : DEFAULT_APP_THEME,
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state) applyAppTheme(state.theme);
      },
    },
  ),
);
