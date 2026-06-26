"use client";

import Link from "next/link";
import type { ModelMetadata } from "@/lib/types";
import { Sheet } from "@/components/ui/sheet";

type ModelDrawerProps = {
  open: boolean;
  onClose: () => void;
  metadata: ModelMetadata | null;
  loading: boolean;
  error: string | null;
};

export function ModelDrawer({
  open,
  onClose,
  metadata,
  loading,
  error,
}: ModelDrawerProps) {
  const sil = metadata?.metrics?.silhouette?.["K-Means"];

  return (
    <Sheet open={open} onClose={onClose} title="Model metadata">
      {loading && <p className="text-sm text-muted">Loading metadata…</p>}
      {error && (
        <p className="rounded-md border border-[oklch(0.58_0.16_25_/_0.3)] bg-[oklch(0.94_0.04_25)] px-3 py-2 text-sm text-ink">
          {error}
        </p>
      )}
      {metadata && (
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-xs font-medium text-muted">Deployment model</dt>
            <dd className="mt-1 font-medium text-ink">
              {metadata.best_model} ({metadata.init_method}) · k={metadata.n_clusters}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted">Silhouette (K-Means)</dt>
            <dd className="mt-1 tabular-nums text-ink">
              {sil !== undefined ? sil.toFixed(4) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted">Features ({metadata.feature_names.length})</dt>
            <dd className="mt-2 flex flex-wrap gap-1.5">
              {metadata.feature_names.map((f) => (
                <span
                  key={f}
                  className="rounded bg-surface px-2 py-0.5 font-mono text-[11px] text-ink"
                >
                  {f}
                </span>
              ))}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted">log1p columns</dt>
            <dd className="mt-2 flex flex-wrap gap-1.5">
              {metadata.log1p_columns.map((f) => (
                <span
                  key={f}
                  className="rounded bg-surface px-2 py-0.5 font-mono text-[11px] text-muted"
                >
                  {f}
                </span>
              ))}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted">Persona map</dt>
            <dd className="mt-2 space-y-2">
              {Object.entries(metadata.persona_map).map(([id, name]) => (
                <div key={id} className="flex gap-2 text-ink">
                  <span className="font-mono text-muted">{id}</span>
                  <span>{name}</span>
                </div>
              ))}
            </dd>
          </div>
        </dl>
      )}
      <div className="mt-6 border-t border-border pt-4">
        <Link
          href="/model"
          onClick={onClose}
          className="inline-flex h-8 items-center rounded-md border border-border bg-canvas px-3 text-xs font-medium text-ink transition-colors hover:bg-surface"
        >
          View full model details
        </Link>
      </div>
    </Sheet>
  );
}
