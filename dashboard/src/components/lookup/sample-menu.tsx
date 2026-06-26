"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SampleOption = {
  id: string;
  label: string;
  mode: "random" | "persona";
  clusterId?: number;
};

const SAMPLE_OPTIONS: SampleOption[] = [
  { id: "random", label: "Random customer", mode: "random" },
  { id: "p0", label: "Sample: Dormant / Inactive", mode: "persona", clusterId: 0 },
  { id: "p1", label: "Sample: Active Transactor", mode: "persona", clusterId: 1 },
  { id: "p2", label: "Sample: Revolver (High-Risk)", mode: "persona", clusterId: 2 },
];

type SampleMenuProps = {
  onSelect: (option: SampleOption) => void;
  loading: boolean;
};

export function SampleMenu({ onSelect, loading }: SampleMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <Button
        type="button"
        variant="secondary"
        disabled={loading}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        Load sample
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
      </Button>
      {open && (
        <ul
          role="menu"
          className="absolute bottom-full left-0 z-[var(--z-drawer)] mb-2 min-w-[15rem] rounded-lg border border-border bg-canvas py-1 shadow-[0_4px_16px_oklch(0.22_0.02_220_/_0.08)]"
        >
          {SAMPLE_OPTIONS.map((opt) => (
            <li key={opt.id} role="none">
              <button
                type="button"
                role="menuitem"
                className="w-full px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-surface"
                onClick={() => {
                  onSelect(opt);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
