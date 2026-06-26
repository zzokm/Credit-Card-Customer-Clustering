"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { fetchClusterMap, fetchPersonas } from "@/lib/api";
import type { ClusterPoint, PersonaRow, SegmentResult } from "@/lib/types";
import { PERSONA_COLORS, personaColor, personaHighlightColor } from "@/lib/personas";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { useSegmentHighlight } from "@/context/segment-highlight-context";

type ScatterDatum = ClusterPoint & { fill: string };

type LookupScatterDatum = {
  x: number;
  y: number;
  fill: string;
  isLookup: true;
};

function LookupTooltipContent({ result }: { result: SegmentResult }) {
  return (
    <div className="max-w-[220px] rounded-md border border-border bg-canvas px-3 py-2 text-xs shadow-sm">
      <p className="font-semibold text-ink">{result.segment_name}</p>
      <p className="mt-1 text-muted">Cluster {result.cluster_id}</p>
      <p className="mt-2 line-clamp-3 text-ink">{result.recommended_action}</p>
      <dl className="mt-2 space-y-1 border-t border-border/60 pt-2">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Utilization</dt>
          <dd className="font-mono tabular-nums text-ink">
            {(result.derived.utilization_rate * 100).toFixed(1)}%
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Payment / min</dt>
          <dd className="font-mono tabular-nums text-ink">
            {result.derived.payment_to_min_ratio.toFixed(2)}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Full payer</dt>
          <dd className="text-ink">{result.derived.full_payer_flag ? "Yes" : "No"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">PCA</dt>
          <dd className="font-mono tabular-nums text-ink">
            ({result.pca.x.toFixed(2)}, {result.pca.y.toFixed(2)})
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function ClusterScatter() {
  const [points, setPoints] = useState<ClusterPoint[]>([]);
  const [personas, setPersonas] = useState<PersonaRow[]>([]);
  const [total, setTotal] = useState(0);
  const [simplified, setSimplified] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<number | "all">("all");
  const [selected, setSelected] = useState<ClusterPoint | null>(null);
  const { highlight, clearHighlight } = useSegmentHighlight();

  useEffect(() => {
    fetchPersonas()
      .then((data) => setPersonas(data.personas))
      .catch(() => setPersonas([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchClusterMap(simplified)
      .then((data) => {
        setPoints(data.points);
        setTotal(data.total_customers);
      })
      .catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : "Could not load cluster map. Ensure the API is running on port 8001.",
        ),
      )
      .finally(() => setLoading(false));
  }, [simplified]);

  const chartData = useMemo(() => {
    const filtered =
      filter === "all" ? points : points.filter((p) => p.cluster_id === filter);
    return filtered.map((p) => ({
      ...p,
      fill: PERSONA_COLORS[p.cluster_id] ?? "oklch(0.5 0.05 220)",
    }));
  }, [points, filter]);

  const legendItems = useMemo(() => {
    if (personas.length > 0) {
      return [...personas].sort((a, b) => a.cluster_id - b.cluster_id);
    }
    const counts = new Map<number, { count: number; name: string }>();
    for (const p of points) {
      const prev = counts.get(p.cluster_id);
      counts.set(p.cluster_id, {
        count: (prev?.count ?? 0) + 1,
        name: p.persona_name,
      });
    }
    const n = points.length || 1;
    return [...counts.entries()]
      .sort(([a], [b]) => a - b)
      .map(([cluster_id, { count, name }]) => ({
        cluster_id,
        persona_name: name,
        pct_of_base: Math.round((count / n) * 1000) / 10,
      }));
  }, [personas, points]);

  const lookupScatterData = useMemo((): LookupScatterDatum[] => {
    if (!highlight) return [];
    return [
      {
        x: highlight.pca.x,
        y: highlight.pca.y,
        fill: personaHighlightColor(highlight.cluster_id),
        isLookup: true,
      },
    ];
  }, [highlight]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink text-balance">Cluster map</h1>
          <p className="mt-2 max-w-prose text-sm text-muted">
            PCA projection of {total.toLocaleString()} customers. Colors match persona
            assignments from the deployed model.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={simplified ? "primary" : "secondary"}
            size="sm"
            onClick={() => setSimplified(true)}
          >
            Simplified (~2k)
          </Button>
          <Button
            variant={!simplified ? "primary" : "secondary"}
            size="sm"
            onClick={() => setSimplified(false)}
          >
            Full dataset
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {(["all", 0, 1, 2] as const).map((id) => (
          <Button
            key={String(id)}
            size="sm"
            variant={filter === id ? "primary" : "secondary"}
            onClick={() => setFilter(id)}
          >
            {id === "all" ? "All personas" : `Cluster ${id}`}
          </Button>
        ))}
        {highlight && (
          <Button size="sm" variant="ghost" onClick={clearHighlight}>
            Clear lookup highlight
          </Button>
        )}
      </div>

      {legendItems.length > 0 && (
        <ul
          className="flex flex-wrap gap-x-5 gap-y-2 text-sm"
          aria-label="Persona color legend"
        >
          {legendItems.map((row) => (
            <li key={row.cluster_id} className="flex items-center gap-2">
              <span
                className="inline-flex size-2.5 shrink-0 rounded-full"
                style={{ background: personaColor(row.cluster_id) }}
                aria-hidden
              />
              <span className="text-ink">
                {row.persona_name.replace(/^The /, "")}
              </span>
              <span className="font-mono text-xs tabular-nums text-muted">
                {row.pct_of_base}%
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="h-[min(520px,60vh)] rounded-lg border border-border bg-canvas p-2">
        {loading && (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            Loading cluster map…
          </div>
        )}
        {error && (
          <div className="flex h-full items-center justify-center px-4 text-sm text-ink">
            {error}
          </div>
        )}
        {!loading && !error && chartData.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            No points match these filters.
          </div>
        )}
        {!loading && !error && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 12, right: 12, bottom: 8, left: 0 }}>
              <CartesianGrid stroke="oklch(0.22 0.02 220 / 0.08)" />
              <XAxis type="number" dataKey="x" name="PC1" tick={{ fontSize: 11 }} />
              <YAxis type="number" dataKey="y" name="PC2" tick={{ fontSize: 11 }} />
              <ZAxis range={[24, 24]} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const p = payload[0].payload as ScatterDatum | LookupScatterDatum;
                  if ("isLookup" in p && p.isLookup && highlight) {
                    return <LookupTooltipContent result={highlight} />;
                  }
                  const point = p as ScatterDatum;
                  return (
                    <div className="rounded-md border border-border bg-canvas px-3 py-2 text-xs shadow-sm">
                      <p className="font-medium text-ink">{point.persona_name}</p>
                      <p className="text-muted">Balance: ${point.balance.toLocaleString()}</p>
                    </div>
                  );
                }}
              />
              <Scatter
                data={chartData}
                onClick={(point) => {
                  const payload = (point as { payload?: ClusterPoint }).payload;
                  if (payload) setSelected(payload);
                }}
              />
              {lookupScatterData.length > 0 && (
                <Scatter
                  data={lookupScatterData}
                  fill={lookupScatterData[0].fill}
                  stroke="oklch(1 0 0)"
                  strokeWidth={2}
                  legendType="none"
                />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>

      <Sheet
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.persona_name ?? "Customer"}
      >
        {selected && (
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs text-muted">Cluster</dt>
              <dd className="font-medium text-ink">{selected.cluster_id}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Balance</dt>
              <dd className="font-mono tabular-nums">${selected.balance.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Credit limit</dt>
              <dd className="font-mono tabular-nums">
                ${selected.credit_limit.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">PCA coordinates</dt>
              <dd className="font-mono text-xs tabular-nums">
                ({selected.x.toFixed(3)}, {selected.y.toFixed(3)})
              </dd>
            </div>
          </dl>
        )}
      </Sheet>
    </div>
  );
}
