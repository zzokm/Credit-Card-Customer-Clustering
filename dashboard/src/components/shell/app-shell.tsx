"use client";

import { useEffect, useState, type ReactNode } from "react";
import { fetchMetadata } from "@/lib/api";
import type { ModelMetadata } from "@/lib/types";
import { SegmentHighlightProvider } from "@/context/segment-highlight-context";
import { ThemeProvider } from "@/context/theme-context";
import { DynamicBackground } from "@/components/shell/dynamic-background";
import { ModelDrawer } from "@/components/shell/model-drawer";
import { TopNav } from "@/components/shell/top-nav";

export function AppShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [metadata, setMetadata] = useState<ModelMetadata | null>(null);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);

  useEffect(() => {
    if (!drawerOpen || metadata) return;
    setMetaLoading(true);
    setMetaError(null);
    fetchMetadata()
      .then(setMetadata)
      .catch(() =>
        setMetaError(
          "Could not load metadata. Ensure the API is running on port 8001.",
        ),
      )
      .finally(() => setMetaLoading(false));
  }, [drawerOpen, metadata]);

  return (
    <ThemeProvider>
      <DynamicBackground />
      <div className="relative z-0 flex min-h-full flex-1 flex-col">
        <SegmentHighlightProvider>
          <TopNav onOpenModel={() => setDrawerOpen(true)} />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
            {children}
          </main>
          <ModelDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            metadata={metadata}
            loading={metaLoading}
            error={metaError}
          />
        </SegmentHighlightProvider>
      </div>
    </ThemeProvider>
  );
}
