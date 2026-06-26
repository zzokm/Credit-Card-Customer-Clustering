"use client";

import { useRouter } from "next/navigation";
import type { SegmentResult } from "@/lib/types";
import { personaBg, personaColor } from "@/lib/personas";
import { Button } from "@/components/ui/button";
import { useSegmentHighlight } from "@/context/segment-highlight-context";

type SegmentResultPanelProps = {
  result: SegmentResult | null;
  error: string | null;
};

export function SegmentResultPanel({ result, error }: SegmentResultPanelProps) {
  const { setHighlight } = useSegmentHighlight();
  const router = useRouter();

  if (error) {
    return (
      <section
        aria-live="polite"
        className="rounded-lg border border-[oklch(0.58_0.16_25_/_0.25)] bg-[oklch(0.97_0.02_25)] px-5 py-4"
      >
        <h2 className="text-sm font-semibold text-ink">Segmentation failed</h2>
        <p className="mt-1 text-sm text-ink">{error}</p>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="rounded-lg border border-dashed border-border bg-surface/50 px-5 py-6">
        <p className="text-sm text-muted">
          Enter customer features to predict segment assignment.
        </p>
      </section>
    );
  }

  const accent = personaColor(result.cluster_id);
  const bg = personaBg(result.cluster_id);

  return (
    <section
      aria-live="polite"
      className="rounded-lg border border-border px-5 py-5"
      style={{ background: bg }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted">
            Cluster {result.cluster_id} · Recommended action
          </p>
          <h2
            className="mt-1 text-xl font-semibold text-ink text-balance"
            style={{ color: "var(--ink)" }}
          >
            {result.segment_name}
          </h2>
          <p className="mt-3 max-w-prose text-sm text-ink">{result.recommended_action}</p>
        </div>
        <span
          className="shrink-0 rounded-full px-3 py-1 text-xs font-medium text-white"
          style={{ background: accent }}
        >
          Persona {result.cluster_id}
        </span>
      </div>
      <dl className="mt-6 grid gap-4 border-t border-border/60 pt-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs text-muted">Utilization</dt>
          <dd className="mt-0.5 font-mono text-sm tabular-nums text-ink">
            {(result.derived.utilization_rate * 100).toFixed(1)}%
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Payment / minimum</dt>
          <dd className="mt-0.5 font-mono text-sm tabular-nums text-ink">
            {result.derived.payment_to_min_ratio.toFixed(2)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Full payer</dt>
          <dd className="mt-0.5 font-mono text-sm text-ink">
            {result.derived.full_payer_flag ? "Yes" : "No"}
          </dd>
        </div>
      </dl>
      <div className="mt-5">
        <Button
          variant="secondary"
          size="sm"
          type="button"
          onClick={() => {
            setHighlight(result);
            router.push("/map");
          }}
        >
          Show on map
        </Button>
      </div>
    </section>
  );
}
