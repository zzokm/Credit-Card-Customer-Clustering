"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AlgorithmRow, KVoteRow, ModelPersonaDetail } from "@/lib/types";
import { personaColor } from "@/lib/personas";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const CHART_AXIS = "oklch(0.42 0.015 220)";
const CHART_GRID = "oklch(0.22 0.02 220 / 0.08)";

type MetricToggleProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
};

function MetricToggle<T extends string>({ options, value, onChange }: MetricToggleProps<T>) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Select metric">
      {options.map((opt) => (
        <Button
          key={opt.value}
          type="button"
          size="sm"
          variant={value === opt.value ? "primary" : "secondary"}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}

export function ZeroInflationChart({
  data,
}: {
  data: { feature: string; zero_pct: number }[];
}) {
  const chartData = [...data].reverse();
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
          <CartesianGrid stroke={CHART_GRID} horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: CHART_AXIS, fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="feature"
            width={140}
            tick={{ fill: CHART_AXIS, fontSize: 10 }}
          />
          <Tooltip
            formatter={(value) => [`${Number(value ?? 0).toFixed(1)}%`, "Zero share"]}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid oklch(0.22 0.02 220 / 0.12)",
              fontSize: 12,
            }}
          />
          <Bar dataKey="zero_pct" fill="oklch(0.5 0.14 215)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function corrColor(value: number): string {
  const t = Math.max(-1, Math.min(1, value));
  if (t >= 0) {
    return `oklch(${0.55 + t * 0.12} ${0.08 + t * 0.08} 165)`;
  }
  return `oklch(${0.55 + Math.abs(t) * 0.1} ${0.06 + Math.abs(t) * 0.06} 25)`;
}

export function CorrelationHeatmap({
  features,
  matrix,
}: {
  features: string[];
  matrix: number[][];
}) {
  const [hover, setHover] = useState<{ row: number; col: number } | null>(null);

  return (
    <div className="overflow-x-auto">
      <div
        className="inline-grid gap-px rounded-lg border border-border bg-border p-px"
        style={{
          gridTemplateColumns: `minmax(7rem, auto) repeat(${features.length}, minmax(2.5rem, 1fr))`,
        }}
      >
        <div className="bg-canvas" />
        {features.map((f) => (
          <div
            key={`h-${f}`}
            className="bg-canvas px-1 py-2 text-center text-[10px] font-medium text-muted [writing-mode:vertical-rl] [text-orientation:mixed] sm:text-[11px]"
          >
            {f.replace(/_/g, " ")}
          </div>
        ))}
        {matrix.map((row, ri) => (
          <div key={features[ri]} className="contents">
            <div className="flex items-center bg-canvas px-2 text-[10px] font-medium text-muted sm:text-[11px]">
              {features[ri].replace(/_/g, " ")}
            </div>
            {row.map((value, ci) => (
              <div
                key={`${ri}-${ci}`}
                className={cn(
                  "flex min-h-9 min-w-9 items-center justify-center text-[10px] tabular-nums text-ink transition-opacity",
                  hover && hover.row !== ri && hover.col !== ci && "opacity-50",
                )}
                style={{ background: corrColor(value) }}
                onMouseEnter={() => setHover({ row: ri, col: ci })}
                onMouseLeave={() => setHover(null)}
                title={`${features[ri]} × ${features[ci]}: r = ${value.toFixed(3)}`}
              >
                {ri === ci ? "1" : value.toFixed(2)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

type KMetric = "silhouette" | "davies_bouldin" | "calinski_harabasz";

export function KSelectionChart({ data, winnerK }: { data: KVoteRow[]; winnerK: number }) {
  const [metric, setMetric] = useState<KMetric>("silhouette");
  const chartData = data.map((row) => ({
    k: `k=${row.k}`,
    kNum: row.k,
    value: row[metric],
  }));

  const higherBetter = metric === "silhouette" || metric === "calinski_harabasz";

  return (
    <div className="space-y-4">
      <MetricToggle<KMetric>
        value={metric}
        onChange={setMetric}
        options={[
          { value: "silhouette", label: "Silhouette" },
          { value: "davies_bouldin", label: "Davies–Bouldin" },
          { value: "calinski_harabasz", label: "Calinski–Harabasz" },
        ]}
      />
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={CHART_GRID} vertical={false} />
            <XAxis dataKey="k" tick={{ fill: CHART_AXIS, fontSize: 12 }} />
            <YAxis tick={{ fill: CHART_AXIS, fontSize: 11 }} width={48} />
            <Tooltip
              formatter={(value) => [Number(value ?? 0).toFixed(4), metric.replace(/_/g, " ")]}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid oklch(0.22 0.02 220 / 0.12)",
                fontSize: 12,
              }}
            />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              shape={(props: {
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                payload?: { kNum: number };
              }) => {
                const { x = 0, y = 0, width = 0, height = 0, payload } = props;
                const isWinner = payload?.kNum === winnerK;
                return (
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={isWinner ? "oklch(0.5 0.14 215)" : "oklch(0.72 0.04 220)"}
                    stroke={isWinner ? "oklch(0.44 0.14 215)" : "none"}
                    strokeWidth={isWinner ? 2 : 0}
                    rx={4}
                  />
                );
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted">
        {higherBetter ? "Higher is better" : "Lower is better"} for this metric. Winner k=
        {winnerK} selected via multi-metric voting (tie-break: highest silhouette).
      </p>
    </div>
  );
}

type AlgoMetric = "silhouette" | "davies_bouldin" | "calinski_harabasz" | "noise_pct";

export function AlgorithmComparisonChart({ data }: { data: AlgorithmRow[] }) {
  const [metric, setMetric] = useState<AlgoMetric>("silhouette");
  const chartData = data.map((row) => ({
    model: row.model,
    value: row[metric] ?? 0,
    isWinner: row.model === "K-Means",
  }));

  return (
    <div className="space-y-4">
      <MetricToggle<AlgoMetric>
        value={metric}
        onChange={setMetric}
        options={[
          { value: "silhouette", label: "Silhouette" },
          { value: "davies_bouldin", label: "Davies–Bouldin" },
          { value: "calinski_harabasz", label: "Calinski–Harabasz" },
          { value: "noise_pct", label: "Noise %" },
        ]}
      />
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={CHART_GRID} vertical={false} />
            <XAxis dataKey="model" tick={{ fill: CHART_AXIS, fontSize: 11 }} />
            <YAxis tick={{ fill: CHART_AXIS, fontSize: 11 }} width={56} />
            <Tooltip
              formatter={(value) => [
                metric === "noise_pct"
                  ? `${Number(value ?? 0).toFixed(2)}%`
                  : Number(value ?? 0).toFixed(4),
                metric.replace(/_/g, " "),
              ]}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid oklch(0.22 0.02 220 / 0.12)",
                fontSize: 12,
              }}
            />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              shape={(props: {
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                payload?: { isWinner: boolean };
              }) => {
                const { x = 0, y = 0, width = 0, height = 0, payload } = props;
                const isWinner = payload?.isWinner;
                return (
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={isWinner ? "oklch(0.5 0.14 215)" : "oklch(0.72 0.04 220)"}
                    stroke={isWinner ? "oklch(0.44 0.14 215)" : "none"}
                    strokeWidth={isWinner ? 2 : 0}
                    rx={4}
                  />
                );
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function PersonaBalanceChart({
  personas,
}: {
  personas: ModelPersonaDetail[];
}) {
  const chartData = personas.map((p) => ({
    name: p.persona_name.replace("The ", ""),
    pct: p.pct_of_base,
    fill: personaColor(p.cluster_id),
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
          <CartesianGrid stroke={CHART_GRID} vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: CHART_AXIS, fontSize: 10 }}
            interval={0}
            angle={-12}
            textAnchor="end"
            height={48}
          />
          <YAxis
            tick={{ fill: CHART_AXIS, fontSize: 11 }}
            width={40}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            formatter={(value) => [`${Number(value ?? 0).toFixed(2)}%`, "Share of base"]}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid oklch(0.22 0.02 220 / 0.12)",
              fontSize: 12,
            }}
          />
          <Bar dataKey="pct" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const PROFILE_LABELS: Record<string, string> = {
  PURCHASES: "Purchases",
  BALANCE: "Balance",
  UTILIZATION_RATE: "Utilization",
  PRC_FULL_PAYMENT: "Full payment",
  CASH_ADVANCE: "Cash advance",
  CREDIT_LIMIT: "Credit limit",
};

export function PersonaProfileRadar({ personas }: { personas: ModelPersonaDetail[] }) {
  const featureKeys = Object.keys(personas[0]?.profile_z ?? {});
  const [visible, setVisible] = useState<Set<number>>(
    () => new Set(personas.map((p) => p.cluster_id)),
  );

  const chartData = useMemo(
    () =>
      featureKeys.map((feat) => {
        const row: Record<string, string | number> = {
          feature: PROFILE_LABELS[feat] ?? feat,
        };
        for (const p of personas) {
          if (visible.has(p.cluster_id)) {
            row[`c${p.cluster_id}`] = p.profile_z[feat];
          }
        }
        return row;
      }),
    [featureKeys, personas, visible],
  );

  const activePersonas = personas.filter((p) => visible.has(p.cluster_id));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Toggle personas">
        {personas.map((p) => {
          const on = visible.has(p.cluster_id);
          return (
            <button
              key={p.cluster_id}
              type="button"
              onClick={() => {
                setVisible((prev) => {
                  const next = new Set(prev);
                  if (next.has(p.cluster_id)) {
                    if (next.size > 1) next.delete(p.cluster_id);
                  } else {
                    next.add(p.cluster_id);
                  }
                  return next;
                });
              }}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors duration-200",
                on
                  ? "border-border bg-surface text-ink"
                  : "border-transparent text-muted hover:bg-surface",
              )}
            >
              <span
                className="mr-1.5 inline-block size-2 rounded-full"
                style={{ background: personaColor(p.cluster_id) }}
                aria-hidden
              />
              {p.persona_name.replace("The ", "")}
            </button>
          );
        })}
      </div>
      <div className="h-[28rem] w-full min-h-[22rem] sm:h-[32rem]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="78%">
            <PolarGrid stroke={CHART_GRID} />
            <PolarAngleAxis dataKey="feature" tick={{ fill: CHART_AXIS, fontSize: 12 }} />
            <PolarRadiusAxis tick={{ fill: CHART_AXIS, fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid oklch(0.22 0.02 220 / 0.12)",
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {activePersonas.map((p) => (
              <Radar
                key={p.cluster_id}
                name={p.persona_name.replace("The ", "")}
                dataKey={`c${p.cluster_id}`}
                stroke={personaColor(p.cluster_id)}
                fill={personaColor(p.cluster_id)}
                fillOpacity={0.15}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted">
        Z-scored cluster means — values show how each persona differs from the average segment on
        key behavioral features.
      </p>
    </div>
  );
}
