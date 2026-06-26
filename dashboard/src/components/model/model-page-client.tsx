"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchModelDetails } from "@/lib/api";
import type { ModelDetails, KVoteRow } from "@/lib/types";
import { personaColor, personaBg } from "@/lib/personas";
import { SectionToc } from "@/components/model/section-toc";
import {
  AlgorithmComparisonChart,
  CorrelationHeatmap,
  KSelectionChart,
  PersonaBalanceChart,
  PersonaProfileRadar,
  ZeroInflationChart,
} from "@/components/model/model-charts";

function SectionPanel({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-b border-border pb-12 last:border-b-0"
    >
      <h2 className="text-xl font-semibold text-ink text-balance">{title}</h2>
      {description && (
        <p className="mt-2 max-w-prose text-sm text-muted">{description}</p>
      )}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-canvas px-4 py-3">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="mt-1 text-lg font-semibold tabular-nums text-ink">{value}</dd>
    </div>
  );
}

function KVoteTable({ rows, winnerK }: { rows: KVoteRow[]; winnerK: number }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-border bg-surface">
          <tr>
            <th className="px-3 py-2 font-medium text-muted">k</th>
            <th className="px-3 py-2 font-medium text-muted text-right">Silhouette</th>
            <th className="px-3 py-2 font-medium text-muted text-right">Davies–Bouldin</th>
            <th className="px-3 py-2 font-medium text-muted text-right">Calinski–H.</th>
            <th className="px-3 py-2 font-medium text-muted text-right">Total rank</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.k}
              className={
                row.k === winnerK
                  ? "bg-surface font-medium"
                  : "border-t border-border/60"
              }
            >
              <td className="px-3 py-2 font-mono text-ink">{row.k}</td>
              <td className="px-3 py-2 text-right font-mono tabular-nums">{row.silhouette.toFixed(4)}</td>
              <td className="px-3 py-2 text-right font-mono tabular-nums">{row.davies_bouldin.toFixed(4)}</td>
              <td className="px-3 py-2 text-right font-mono tabular-nums">
                {row.calinski_harabasz.toFixed(1)}
              </td>
              <td className="px-3 py-2 text-right font-mono tabular-nums">{row.Total_Rank}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FeatureList({ items, muted }: { items: string[]; muted?: boolean }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((f) => (
        <li
          key={f}
          className={`rounded px-2 py-0.5 font-mono text-[11px] ${
            muted ? "bg-surface text-muted" : "bg-surface text-ink"
          }`}
        >
          {f}
        </li>
      ))}
    </ul>
  );
}

export function ModelPageClient() {
  const [data, setData] = useState<ModelDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchModelDetails()
      .then(setData)
      .catch(() =>
        setError("Could not load model details. Ensure the API is running on port 8001."),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8" aria-busy="true" aria-label="Loading model details">
        <div className="h-8 w-64 animate-pulse rounded bg-surface" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-surface" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-lg bg-surface" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="rounded-lg border border-[oklch(0.58_0.16_25_/_0.3)] bg-[oklch(0.94_0.04_25)] px-4 py-3 text-sm text-ink">
        {error ?? "Model details unavailable."}
      </p>
    );
  }

  const { overview } = data;

  return (
    <div className="lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="mb-8 hidden lg:block">
        <div className="sticky top-20">
          <SectionToc />
        </div>
      </aside>

      <div className="min-w-0 space-y-12">
        <header>
          <h1 className="text-2xl font-semibold text-ink text-balance">Model details</h1>
          <p className="mt-2 max-w-prose text-sm text-muted">
            Notebook pipeline validation — dataset provenance, feature engineering, k-selection,
            algorithm comparison, and persona definitions grounded in saved artifacts.
          </p>
          <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Deployment model" value={`${overview.best_model} (k=${overview.n_clusters})`} />
            <Stat
              label="Silhouette"
              value={overview.silhouette?.toFixed(4) ?? "—"}
            />
            <Stat label="Customers" value={overview.customer_count.toLocaleString()} />
            <Stat label="Model features" value={String(overview.feature_count)} />
          </dl>
        </header>

        <SectionPanel
          id="overview"
          title="Overview"
          description={`${overview.init_method} initialization on ${overview.customer_count.toLocaleString()} customers. Primary validation metrics for the deployed K-Means model.`}
        >
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-medium text-muted">Davies–Bouldin</dt>
              <dd className="mt-1 font-mono text-ink tabular-nums">
                {overview.davies_bouldin?.toFixed(4) ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">Calinski–Harabasz</dt>
              <dd className="mt-1 font-mono text-ink tabular-nums">
                {overview.calinski_harabasz?.toFixed(1) ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">log1p columns</dt>
              <dd className="mt-1 font-mono text-ink tabular-nums">{overview.log1p_count}</dd>
            </div>
          </dl>
        </SectionPanel>

        <SectionPanel
          id="dataset"
          title="Dataset & cleaning"
          description={`Source: ${data.dataset.source}. Behavioral and account features merged for segmentation.`}
        >
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-xs font-medium text-muted">Raw shape</dt>
              <dd className="mt-1 text-ink">
                {data.dataset.raw_rows.toLocaleString()} × {data.dataset.raw_columns}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">Working columns</dt>
              <dd className="mt-1 text-ink">{data.dataset.working_columns}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">Duplicate rows</dt>
              <dd className="mt-1 text-ink">{data.dataset.duplicate_rows}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">Missing values</dt>
              <dd className="mt-1 text-sm text-ink">
                {data.dataset.missing_values
                  .map((m) => `${m.column} (${m.count})`)
                  .join(", ")}
              </dd>
            </div>
          </dl>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted">
            {data.dataset.cleaning_notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </SectionPanel>

        <SectionPanel
          id="features"
          title="Features & engineering"
          description={`${data.features.api_input_count} API inputs expand to ${data.features.model_features.length} scaled model features after engineering and log1p transforms.`}
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-ink">Spending behavior</h3>
              <div className="mt-2">
                <FeatureList items={data.features.groups.spending} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">Account & payments</h3>
              <div className="mt-2">
                <FeatureList items={data.features.groups.account} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">Engineered at inference</h3>
              <div className="mt-2">
                <FeatureList items={data.features.groups.engineered} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">log1p transform</h3>
              <p className="mt-1 text-sm text-muted">
                Applied to skewed, zero-inflated columns before scaling — same order as the
                notebook pipeline.
              </p>
              <div className="mt-2">
                <FeatureList items={data.features.log1p_columns} muted />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">Full model feature set</h3>
              <div className="mt-2">
                <FeatureList items={data.features.model_features} />
              </div>
            </div>
          </div>
        </SectionPanel>

        <SectionPanel
          id="eda"
          title="EDA highlights"
          description="Curated exploratory views that motivated scaling and feature selection — not every notebook histogram."
        >
          <div className="space-y-10">
            <div>
              <h3 className="text-sm font-semibold text-ink">Zero-inflation by feature</h3>
              <p className="mt-1 text-sm text-muted">
                Many card features are sparse at zero. High zero share justifies log1p and
                cluster-based segmentation over raw thresholds.
              </p>
              <div className="mt-4">
                <ZeroInflationChart data={data.zero_inflation} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">Core feature correlations</h3>
              <p className="mt-1 text-sm text-muted">
                Purchases correlate with purchase frequency; cash advance amount with cash-advance
                frequency. Redundancy informed correlation-based feature selection.
              </p>
              <div className="mt-4">
                <CorrelationHeatmap
                  features={data.correlation.features}
                  matrix={data.correlation.matrix}
                />
              </div>
            </div>
          </div>
        </SectionPanel>

        <SectionPanel
          id="k-selection"
          title="K selection"
          description="Multi-metric voting over k ∈ {3,…,7}. A single metric can bias cluster count; voting balances silhouette, Davies–Bouldin, and Calinski–Harabasz ranks."
        >
          <div className="space-y-6">
            <KVoteTable rows={data.k_voting} winnerK={overview.n_clusters} />
            <KSelectionChart data={data.k_voting} winnerK={overview.n_clusters} />
          </div>
        </SectionPanel>

        <SectionPanel
          id="validation"
          title="Algorithm comparison"
          description="K-Means++, DBSCAN, and Agglomerative clustering compared on the same scaled feature space. K-Means++ deployed for real-time .predict() and operational k bounds."
        >
          <div className="space-y-6">
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="border-b border-border bg-surface">
                  <tr>
                    <th className="px-3 py-2 font-medium text-muted">Model</th>
                    <th className="px-3 py-2 font-medium text-muted text-right">Silhouette</th>
                    <th className="px-3 py-2 font-medium text-muted text-right">Davies–B.</th>
                    <th className="px-3 py-2 font-medium text-muted text-right">Clusters</th>
                    <th className="px-3 py-2 font-medium text-muted text-right">Noise %</th>
                    <th className="px-3 py-2 font-medium text-muted text-right">Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {data.algorithm_comparison.map((row) => (
                    <tr
                      key={row.model}
                      className={
                        row.model === "K-Means"
                          ? "bg-surface font-medium"
                          : "border-t border-border/60"
                      }
                    >
                      <td className="px-3 py-2 text-ink">{row.model}</td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums">
                        {row.silhouette?.toFixed(4) ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums">
                        {row.davies_bouldin?.toFixed(4) ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums">
                        {row.n_clusters ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums">
                        {row.noise_pct != null ? `${row.noise_pct.toFixed(2)}%` : "—"}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums">
                        {row.composite_rank ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AlgorithmComparisonChart data={data.algorithm_comparison} />
          </div>
        </SectionPanel>

        <SectionPanel
          id="personas"
          title="Persona definitions"
          description="Business personas assigned via cluster profile scoring. For operational aggregates, see the Personas table."
        >
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-semibold text-ink">Segment balance</h3>
              <div className="mt-4 max-w-xl">
                <PersonaBalanceChart personas={data.personas} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">Cluster profiles (z-scored)</h3>
              <div className="mt-4">
                <PersonaProfileRadar personas={data.personas} />
              </div>
            </div>
            <div className="space-y-4">
              {data.personas.map((p) => (
                <article
                  key={p.cluster_id}
                  className="rounded-lg border border-border p-5"
                  style={{ background: personaBg(p.cluster_id) }}
                >
                  <div className="flex flex-wrap items-start gap-3">
                    <span
                      className="mt-1 inline-flex size-2.5 shrink-0 rounded-full"
                      style={{ background: personaColor(p.cluster_id) }}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-ink">{p.persona_name}</h3>
                      <p className="mt-1 text-sm text-muted">
                        Cluster {p.cluster_id} · {p.customer_count.toLocaleString()} customers (
                        {p.pct_of_base}% of base)
                      </p>
                      <p className="mt-3 max-w-prose text-sm text-ink">{p.narrative}</p>
                      {(p.high_features.length > 0 || p.low_features.length > 0) && (
                        <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                          {p.high_features.length > 0 && (
                            <div>
                              <dt className="font-medium text-muted">Relatively high</dt>
                              <dd className="mt-1 font-mono text-ink">
                                {p.high_features.join(", ")}
                              </dd>
                            </div>
                          )}
                          {p.low_features.length > 0 && (
                            <div>
                              <dt className="font-medium text-muted">Relatively low</dt>
                              <dd className="mt-1 font-mono text-ink">
                                {p.low_features.join(", ")}
                              </dd>
                            </div>
                          )}
                        </dl>
                      )}
                      <p className="mt-3 text-sm font-medium text-ink">
                        Recommended action: {p.recommended_action}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <p className="text-sm">
              <Link href="/personas" className="font-medium text-primary hover:underline">
                Full persona aggregates table →
              </Link>
            </p>
          </div>
        </SectionPanel>

        <SectionPanel
          id="pipeline"
          title="Inference pipeline"
          description="End-to-end path from API input to segment assignment — mirrors the notebook artifact export."
        >
          <ol className="space-y-3">
            {data.pipeline_steps.map((step, i) => (
              <li key={step} className="flex gap-3 text-sm">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface font-mono text-xs font-medium text-muted">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-ink">{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap gap-4 text-sm">
            <Link href="/lookup" className="font-medium text-primary hover:underline">
              Try segment lookup →
            </Link>
            <Link href="/map" className="font-medium text-primary hover:underline">
              Open cluster map →
            </Link>
          </div>
        </SectionPanel>
      </div>
    </div>
  );
}
