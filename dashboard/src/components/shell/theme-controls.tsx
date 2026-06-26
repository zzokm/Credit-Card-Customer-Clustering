"use client";

import { Layers, Moon, Sun } from "lucide-react";
import { BACKGROUND_LABELS, useTheme } from "@/context/theme-context";
import { Button } from "@/components/ui/button";

export function ThemeControls() {
  const { theme, toggleTheme, backgroundMode, cycleBackgroundMode } = useTheme();

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="secondary"
        size="sm"
        type="button"
        onClick={toggleTheme}
        aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        title={theme === "light" ? "Dark mode" : "Light mode"}
      >
        {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        type="button"
        onClick={cycleBackgroundMode}
        aria-label={`Background: ${BACKGROUND_LABELS[backgroundMode]}. Click to change.`}
        title={`Background: ${BACKGROUND_LABELS[backgroundMode]}`}
        className="gap-1.5"
      >
        <Layers className="size-4 shrink-0" />
        <span className="hidden text-xs sm:inline">{BACKGROUND_LABELS[backgroundMode]}</span>
      </Button>
    </div>
  );
}
