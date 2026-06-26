"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  ReferenceDot,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { fetchClusterMap } from "@/lib/api";
import type { ClusterPoint } from "@/lib/types";
import { PERSONA_COLORS } from "@/lib/personas";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { useSegmentHighlight } from "@/context/segment-highlight-context";

type ScatterDatum = ClusterPoint & { fill: string };

export function ClusterScatter() {
  const [points, setPoints] = useState<ClusterPoint[]>([]);
  const [total, setTotal] = useState(0);
  const [simplified, setSimplified] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<number | "all">("all");
  const [selected, setSelected] = useState<ClusterPoint | null>(null);
  const { highlight, clearHighlight } = useSegmentHighlight();

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

  const highlightPoint = useMemo(() => {
    if (!highlight) return null;
    return {
      x: highlight.pca.x,
      y: highlight.pca.y,
      cluster_id: highlight.cluster_id,
      persona_name: highlight.segment_name,
      fill: PERSONA_COLORS[highlight.cluster_id],
    };
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
                  const p = payload[0].payload as ScatterDatum;
                  return (
                    <div className="rounded-md border border-border bg-canvas px-3 py-2 text-xs shadow-sm">
                      <p className="font-medium text-ink">{p.persona_name}</p>
                      <p className="text-muted">Balance: ${p.balance.toLocaleString()}</p>
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
              {highlightPoint && (
                <ReferenceDot
                  x={highlightPoint.x}
                  y={highlightPoint.y}
                  r={9}
                  fill={highlightPoint.fill}
                  stroke="oklch(1 0 0)"
                  strokeWidth={2}
                  label={{
                    value: "Lookup",
                    position: "top",
                    fontSize: 10,
                    fill: "oklch(0.22 0.02 220)",
                  }}
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
