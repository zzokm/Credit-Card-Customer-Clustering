"use client";

import { useTheme } from "@/context/theme-context";

export function DynamicBackground() {
  const { backgroundMode } = useTheme();

  return (
    <div
      className="dynamic-bg pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
      data-bg-mode={backgroundMode}
    >
      {backgroundMode === "aurora" && (
        <>
          <div className="dynamic-bg__blob dynamic-bg__blob--0" />
          <div className="dynamic-bg__blob dynamic-bg__blob--1" />
          <div className="dynamic-bg__blob dynamic-bg__blob--2" />
        </>
      )}
      {backgroundMode === "flow" && (
        <>
          <div className="dynamic-bg__flow dynamic-bg__flow--a" />
          <div className="dynamic-bg__flow dynamic-bg__flow--b" />
        </>
      )}
      {backgroundMode === "grid" && (
        <>
          <div className="dynamic-bg__grid" />
          <div className="dynamic-bg__grid-glow" />
        </>
      )}
      <div className="dynamic-bg__veil" />
    </div>
  );
}
