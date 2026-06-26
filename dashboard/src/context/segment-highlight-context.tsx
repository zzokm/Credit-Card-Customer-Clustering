"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SegmentResult } from "@/lib/types";

type Highlight = SegmentResult | null;

type SegmentHighlightContextValue = {
  highlight: Highlight;
  setHighlight: (result: Highlight) => void;
  clearHighlight: () => void;
};

const SegmentHighlightContext = createContext<SegmentHighlightContextValue | null>(
  null,
);

export function SegmentHighlightProvider({ children }: { children: ReactNode }) {
  const [highlight, setHighlightState] = useState<Highlight>(null);

  const setHighlight = useCallback((result: Highlight) => {
    setHighlightState(result);
  }, []);

  const clearHighlight = useCallback(() => {
    setHighlightState(null);
  }, []);

  const value = useMemo(
    () => ({ highlight, setHighlight, clearHighlight }),
    [highlight, setHighlight, clearHighlight],
  );

  return (
    <SegmentHighlightContext.Provider value={value}>
      {children}
    </SegmentHighlightContext.Provider>
  );
}

export function useSegmentHighlight() {
  const ctx = useContext(SegmentHighlightContext);
  if (!ctx) {
    throw new Error("useSegmentHighlight must be used within SegmentHighlightProvider");
  }
  return ctx;
}
