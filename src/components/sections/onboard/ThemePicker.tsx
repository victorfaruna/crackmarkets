"use client";

import { useOnboardStore } from "@/src/lib/stores/onboardStore";
import { useAppStore } from "@/src/lib/stores/appStore";

const themes = [
  {
    id: "light" as const,
    label: "Light",
    description: "Clean & minimal",
    bg: "var(--background)",
    surface: "var(--primary)",
    text: "var(--secondary)",
    accent: "var(--accent)",
    border: "var(--subtext)",
  },
  {
    id: "dark" as const,
    label: "Dark",
    description: "Easy on the eyes",
    bg: "var(--background)",
    surface: "var(--primary)",
    text: "var(--secondary)",
    accent: "var(--accent)",
    border: "var(--subtext)",
  },
];

/* ─── Mini preview card ──────────────────────────────────────────────────── */

const ThemePreview = ({
  theme,
  isSelected,
}: {
  theme: (typeof themes)[number];
  isSelected: boolean;
}) => (
  <div
    className="w-full rounded-lg overflow-hidden transition-none"
    style={{
      backgroundColor: theme.bg,
      outlineWidth: 2,
      outlineStyle: "groove",
      outlineColor: isSelected ? theme.accent : theme.border,
    }}
  >
    {/* Fake topbar */}
    <div
      className="flex items-center gap-1.5 px-3 py-2 border-b"
      style={{ borderColor: theme.border }}
    >
      <div
        className="size-1.5 rounded-full opacity-40"
        style={{ background: theme.text }}
      />
      <div
        className="size-1.5 rounded-full opacity-40"
        style={{ background: theme.text }}
      />
      <div
        className="size-1.5 rounded-full opacity-40"
        style={{ background: theme.text }}
      />
    </div>

    {/* Fake content */}
    <div
      className="p-3 flex flex-col gap-2"
      style={{ backgroundColor: theme.surface }}
    >
      {/* Fake title bar */}
      <div className="flex items-center gap-2">
        <div
          className="h-1 rounded-full w-16"
          style={{ backgroundColor: theme.text, opacity: 0.4 }}
        />
        <div className="flex-1" />
        <div
          className="h-3 w-6 rounded-full"
          style={{ backgroundColor: theme.accent, opacity: 0.4 }}
        />
      </div>

      {/* Fake rows */}
      {[0.5, 0.35, 0.5].map((op, i) => (
        <div
          key={i}
          className="h-1 rounded-full"
          style={{
            backgroundColor: theme.text,
            opacity: op,
            width: i === 1 ? "55%" : "80%",
          }}
        />
      ))}

      {/* Fake card strip */}
      <div
        className="mt-1 h-2 rounded-xl"
        style={{ backgroundColor: theme.bg, opacity: 0.7 }}
      />
    </div>
  </div>
);

/* ─── Step component ─────────────────────────────────────────────────────── */

const ThemePicker = () => {
  const { next } = useOnboardStore();
  const { theme, setTheme } = useAppStore();

  return (
    <div className="flex flex-col gap-6 items-center w-full max-w-3xl animate-fade-in">
      {/* Heading */}
      <div className="flex flex-col items-center gap-1">
        <p className="font-medium text-xl text-secondary text-center leading-none">
          Choose Theme
        </p>
        <p className="text-subtext font-medium text-center">
          Pick the look that feels right for you
        </p>
      </div>

      {/* Theme cards */}
      <div className="flex w-full border-[0.5px] border-subtext/50 rounded-lg overflow-hidden">
        {themes.map((t) => {
          const isSelected = theme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex flex-1 flex-col gap-2 py-4 pt-7 px-10  transition-all duration-500 ease-in-out text-left ${
                isSelected ? "bg-secondary/10" : "bg-primary"
              }`}
            >
              <ThemePreview isSelected={isSelected} theme={t} />

              <div className="flex w-full items-center justify-center px-0.5">
                <p
                  className={`text-sm text-center font-semibold ${!isSelected ? "text-secondary" : "text-secondary"}`}
                >
                  {t.label}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Nav buttons */}
      <div className="flex gap-5 w-full max-w-md">
        <button
          onClick={next}
          className="w-fit px-10 mx-auto flex border items-center justify-center gap-2 rounded-full bg-secondary font-semibold text-primary py-3 whitespace-nowrap transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ThemePicker;
