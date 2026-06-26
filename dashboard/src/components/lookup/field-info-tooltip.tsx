"use client";

import { useId, useState } from "react";
import { Info } from "lucide-react";
import type { SegmentFieldInfo } from "@/lib/segment-field-info";
import { cn } from "@/lib/utils";

type FieldInfoTooltipProps = {
  label: string;
  info: SegmentFieldInfo;
  className?: string;
};

export function FieldInfoTooltip({ label, info, className }: FieldInfoTooltipProps) {
  const tooltipId = useId();
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("relative inline-flex", className)}>
      <button
        type="button"
        className="rounded p-0.5 text-muted transition-colors duration-200 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1"
        aria-label={`About ${label}`}
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <Info className="size-3.5" aria-hidden />
      </button>
      <div
        id={tooltipId}
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-0 top-full z-[var(--z-drawer)] mt-1.5 w-[min(17rem,calc(100vw-2rem))] rounded-lg border border-border bg-canvas px-3 py-2.5 text-left shadow-[0_4px_16px_oklch(0.22_0.02_220_/_0.1)] transition-[opacity,transform] duration-150 ease-[var(--ease-out)] motion-reduce:transition-none sm:left-1/2 sm:-translate-x-1/2",
          open
            ? "translate-y-0 opacity-100"
            : "invisible translate-y-1 opacity-0",
        )}
      >
        <p className="text-xs font-medium text-ink">{label}</p>
        <dl className="mt-2 space-y-2 text-xs">
          <div>
            <dt className="font-medium text-muted">What it is</dt>
            <dd className="mt-0.5 text-ink">{info.description}</dd>
          </div>
          <div>
            <dt className="font-medium text-muted">What to enter</dt>
            <dd className="mt-0.5 text-ink">{info.enter}</dd>
          </div>
          <div>
            <dt className="font-medium text-muted">Valid range</dt>
            <dd className="mt-0.5 text-ink">{info.range}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
