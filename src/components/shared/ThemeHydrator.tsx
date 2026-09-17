"use client";

import { useEffect } from "react";
import { useAppStore } from "@/src/lib/stores/appStore";
import { applyAppTheme } from "@/src/lib/theme";

export default function ThemeHydrator() {
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    applyAppTheme(theme);
  }, [theme]);

  return null;
}
