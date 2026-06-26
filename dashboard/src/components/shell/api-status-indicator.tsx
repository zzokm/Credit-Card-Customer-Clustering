"use client";

import { useEffect, useState } from "react";
import { checkApiLive } from "@/lib/api";
import { cn } from "@/lib/utils";

const POLL_MS = 30_000;

export function ApiStatusIndicator() {
  const [live, setLive] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const ok = await checkApiLive();
      if (!cancelled) setLive(ok);
    };

    void run();
    const id = window.setInterval(() => void run(), POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const label =
    live === null
      ? "Checking API and model…"
      : live
        ? "API and model live"
        : "API or model unavailable";

  return (
    <div
      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted"
      title={label}
      aria-live="polite"
    >
      <span className="relative flex size-2 shrink-0" aria-hidden>
        <span
          className={cn(
            "absolute inline-flex size-full rounded-full",
            live === null && "bg-muted/40",
            live === true && "bg-[oklch(0.62_0.17_145)]",
            live === false && "bg-[oklch(0.58_0.16_25)]",
          )}
        />
        {live === true && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-[oklch(0.62_0.17_145_/_0.55)]" />
        )}
      </span>
      <span className="hidden whitespace-nowrap sm:inline">
        {live === null ? "Connecting…" : live ? "Live" : "Offline"}
      </span>
    </div>
  );
}
