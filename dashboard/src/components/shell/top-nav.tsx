"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ApiStatusIndicator } from "@/components/shell/api-status-indicator";

const NAV = [
  { href: "/lookup", label: "Segment lookup" },
  { href: "/map", label: "Cluster map" },
  { href: "/personas", label: "Personas" },
  { href: "/model", label: "Model details" },
] as const;

type TopNavProps = {
  onOpenModel: () => void;
};

export function TopNav({ onOpenModel }: TopNavProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] border-b border-border bg-canvas/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <div className="min-w-0 shrink-0">
          <p className="text-base font-semibold text-ink text-balance">Segment Console</p>
          <p className="hidden text-xs text-muted sm:block">
            K-Means++ · 3 personas · CC GENERAL
          </p>
        </div>
        <nav className="flex flex-1 items-center gap-1 overflow-x-auto" aria-label="Main">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200",
                  active
                    ? "bg-surface text-ink"
                    : "text-muted hover:bg-surface hover:text-ink",
                )}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <ApiStatusIndicator />
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenModel}
          aria-label="Open model metadata"
        >
          <Info className="size-4" />
          <span className="hidden sm:inline">Model</span>
        </Button>
      </div>
    </header>
  );
}
