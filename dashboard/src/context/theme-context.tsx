"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";
export type BackgroundMode = "aurora" | "flow" | "grid";

const THEME_KEY = "segment-theme";
const BG_KEY = "segment-bg";

type ThemeContextValue = {
  theme: Theme;
  backgroundMode: BackgroundMode;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setBackgroundMode: (mode: BackgroundMode) => void;
  cycleBackgroundMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const BG_CYCLE: BackgroundMode[] = ["aurora", "flow", "grid"];

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function readStoredBackground(): BackgroundMode {
  if (typeof window === "undefined") return "aurora";
  try {
    const v = localStorage.getItem(BG_KEY);
    if (v === "flow" || v === "grid" || v === "aurora") return v;
  } catch {
    /* ignore */
  }
  return "aurora";
}

function applyDom(theme: Theme, backgroundMode: BackgroundMode) {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.setAttribute("data-bg", backgroundMode);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [backgroundMode, setBackgroundModeState] = useState<BackgroundMode>("aurora");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = readStoredTheme();
    const b = readStoredBackground();
    setThemeState(t);
    setBackgroundModeState(b);
    applyDom(t, b);
    setMounted(true);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  const setBackgroundMode = useCallback((next: BackgroundMode) => {
    setBackgroundModeState(next);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyDom(theme, backgroundMode);
    try {
      localStorage.setItem(THEME_KEY, theme);
      localStorage.setItem(BG_KEY, backgroundMode);
    } catch {
      /* ignore */
    }
  }, [theme, backgroundMode, mounted]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [setTheme, theme]);

  const cycleBackgroundMode = useCallback(() => {
    const idx = BG_CYCLE.indexOf(backgroundMode);
    const next = BG_CYCLE[(idx + 1) % BG_CYCLE.length];
    setBackgroundMode(next);
  }, [backgroundMode, setBackgroundMode]);

  const value = useMemo(
    () => ({
      theme,
      backgroundMode,
      setTheme,
      toggleTheme,
      setBackgroundMode,
      cycleBackgroundMode,
    }),
    [theme, backgroundMode, setTheme, toggleTheme, setBackgroundMode, cycleBackgroundMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export const BACKGROUND_LABELS: Record<BackgroundMode, string> = {
  aurora: "Aurora",
  flow: "Flow",
  grid: "Grid",
};
