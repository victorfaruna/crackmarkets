export const APP_STORE_STORAGE_KEY = "trackmarkets-app-state";

export const APP_THEMES = ["light", "dark"] as const;
export type AppTheme = (typeof APP_THEMES)[number];

export const DEFAULT_APP_THEME: AppTheme = "dark";

export function isAppTheme(value: unknown): value is AppTheme {
  return APP_THEMES.includes(value as AppTheme);
}

export function applyAppTheme(theme: AppTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
}

/**
 * Runs from the document head before React hydrates. Zustand persist stores an
 * object shaped as `{ state: { theme } }`, so this applies that same source of
 * truth before the browser paints the application UI.
 */
export const THEME_BOOTSTRAP_SCRIPT = `
(function () {
  try {
    var value = window.localStorage.getItem(${JSON.stringify(APP_STORE_STORAGE_KEY)});
    if (!value) return;
    var persisted = JSON.parse(value);
    var theme = persisted && persisted.state && persisted.state.theme;
    if (theme === "light" || theme === "dark") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  } catch (_) {}
})();
`;
