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
import {
  BUSINESS_QUESTIONS,
  CLUSTERING_ALGORITHMS,
  ENGINEERED_FEATURES,
  METRIC_DEFINITIONS,
  RAW_FEATURE_DEFINITIONS,
} from "@/lib/model-content";
import { PERSONA_DETAILS } from "@/lib/persona-detail-content";

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
            Notebook pipeline validation — feature engineering, k-selection,
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
          id="business-questions"
          title="Business questions"
          description="The segmentation pipeline answers six FinTech policy questions that motivate feature engineering, clustering, and persona actions."
        >
          <ol className="space-y-4">
            {BUSINESS_QUESTIONS.map((item, i) => (
              <li key={item.title} className="flex gap-3 text-sm">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface font-mono text-xs font-medium text-muted">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-ink">{item.title}</p>
                  <p className="mt-0.5 text-muted">{item.question}</p>
                </div>
              </li>
            ))}
          </ol>
        </SectionPanel>

        <SectionPanel
          id="features"
          title="Features & engineering"
          description={`${data.features.api_input_count} API inputs expand to ${data.features.model_features.length} scaled model features after engineering and log1p transforms.`}
        >
          <div className="space-y-10">
            <div>
              <h3 className="text-sm font-semibold text-ink">Dataset columns (definitions)</h3>
              <p className="mt-1 text-sm text-muted">
                CC GENERAL raw fields in column order. CUST_ID is dropped before modeling;{" "}
                PURCHASES_INSTALLMENTS_FREQUENCY is excluded during feature selection.
              </p>
              <div className="mt-4 overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-border bg-surface">
                    <tr>
                      <th className="px-3 py-2 font-medium text-muted">Column</th>
                      <th className="px-3 py-2 font-medium text-muted">Definition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RAW_FEATURE_DEFINITIONS.map((row) => (
                      <tr key={row.column} className="border-t border-border/60">
                        <td className="px-3 py-2 align-top font-mono text-xs text-ink">
                          {row.column}
                        </td>
                        <td className="px-3 py-2 text-ink">{row.definition}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-ink">Engineered features</h3>
              <p className="mt-1 text-sm text-muted">
                Created at inference time from raw inputs — same formulas as the notebook.
              </p>
              <div className="mt-4 overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b border-border bg-surface">
                    <tr>
                      <th className="px-3 py-2 font-medium text-muted">Feature</th>
                      <th className="px-3 py-2 font-medium text-muted">Formula</th>
                      <th className="px-3 py-2 font-medium text-muted">In simple terms</th>
                      <th className="px-3 py-2 font-medium text-muted">Why it helps</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ENGINEERED_FEATURES.map((row) => (
                      <tr key={row.name} className="border-t border-border/60">
                        <td className="px-3 py-2 align-top font-mono text-xs text-ink">
                          {row.name}
                        </td>
                        <td className="px-3 py-2 align-top text-ink">{row.formula}</td>
                        <td className="px-3 py-2 align-top text-ink">{row.simple}</td>
                        <td className="px-3 py-2 align-top text-muted">{row.useful}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6 border-t border-border pt-8">
              <div>
                <h3 className="text-sm font-semibold text-ink">Spending behavior (API inputs)</h3>
                <div className="mt-2">
                  <FeatureList items={data.features.groups.spending} />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink">Account & payments (API inputs)</h3>
                <div className="mt-2">
                  <FeatureList items={data.features.groups.account} />
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
          title="Algorithms & metrics"
          description="Three clustering methods compared on the same scaled features. K-Means++ is deployed because it supports real-time .predict() for the API — not because it wins every metric."
        >
          <div className="space-y-10">
            <div>
              <h3 className="text-sm font-semibold text-ink">Clustering algorithms compared</h3>
              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                {CLUSTERING_ALGORITHMS.map((algo) => (
                  <article
                    key={algo.name}
                    className={`rounded-lg border p-4 ${
                      algo.deployed
                        ? "border-primary/30 bg-surface"
                        : "border-border bg-canvas"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-ink">{algo.name}</h4>
                      {algo.deployed && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                          Deployed
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted">{algo.type}</p>
                    <p className="mt-3 text-sm text-ink">{algo.summary}</p>
                    <div className="mt-4 space-y-3 text-xs">
                      <div>
                        <p className="font-medium text-muted">Strengths</p>
                        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-ink">
                          {algo.strengths.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-muted">Limitations</p>
                        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-muted">
                          {algo.weaknesses.map((w) => (
                            <li key={w}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-ink">Hierarchical dendrogram (Ward linkage)</h3>
              <p className="mt-1 text-sm text-muted">
                Built on a 500-customer sample for readability. Shows how Agglomerative clustering
                merges similar customers bottom-up. A horizontal cut at the chosen height yields k=3
                segments — same k as K-Means for a fair comparison.
              </p>
              <figure className="mt-4 overflow-hidden rounded-lg border border-border bg-canvas p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/model/dendrogram.png"
                  alt="Hierarchical clustering dendrogram with Ward linkage on a sample of credit card customers"
                  className="mx-auto max-h-[420px] w-full object-contain"
                />
                <figcaption className="mt-2 text-center text-xs text-muted">
                  Dendrogram from notebook — merge height indicates similarity between groups
                </figcaption>
              </figure>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-ink">Evaluation metrics explained</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {METRIC_DEFINITIONS.map((m) => (
                  <div
                    key={m.name}
                    className="rounded-lg border border-border bg-canvas px-4 py-3 text-sm"
                  >
                    <p className="font-medium text-ink">{m.name}</p>
                    <p className="mt-1 text-xs text-muted">
                      {m.direction} · {m.range}
                    </p>
                    <p className="mt-2 text-muted">{m.explanation}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-ink">Full comparison (all columns)</h3>
              <p className="mt-1 text-sm text-muted">
                Values from saved notebook artifacts. K-Means and DBSCAN tied on composite rank (3.0);
                K-Means chosen for production scoring.
              </p>
              <div className="mt-4 overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[880px] text-left text-sm">
                  <thead className="border-b border-border bg-surface">
                    <tr>
                      <th className="px-3 py-2 font-medium text-muted">Model</th>
                      <th className="px-3 py-2 font-medium text-muted text-right">Silhouette ↑</th>
                      <th className="px-3 py-2 font-medium text-muted text-right">Davies–B. ↓</th>
                      <th className="px-3 py-2 font-medium text-muted text-right">Calinski–H. ↑</th>
                      <th className="px-3 py-2 font-medium text-muted text-right">Clusters</th>
                      <th className="px-3 py-2 font-medium text-muted text-right">Noise %</th>
                      <th className="px-3 py-2 font-medium text-muted text-right">Rank DB</th>
                      <th className="px-3 py-2 font-medium text-muted text-right">Rank Sil</th>
                      <th className="px-3 py-2 font-medium text-muted text-right">Composite</th>
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
                          {row.calinski_harabasz?.toFixed(2) ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums">
                          {row.n_clusters ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums">
                          {row.noise_pct != null ? row.noise_pct.toFixed(2) : "—"}
                        </td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums">
                          {row.rank_db?.toFixed(1) ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums">
                          {row.rank_sil?.toFixed(1) ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums">
                          {row.composite_rank?.toFixed(1) ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
              {data.personas.map((p) => {
                const detail = PERSONA_DETAILS[p.cluster_id];
                return (
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
                      <h3 className="font-semibold text-ink">
                        Cluster {p.cluster_id} — {p.persona_name}
                      </h3>
                      <p className="mt-1 text-sm text-muted">
                        {p.customer_count.toLocaleString()} customers ({p.pct_of_base}% of base)
                        {detail ? ` · Priority: ${detail.priority}` : ""}
                      </p>
                      {detail && (
                        <p className="mt-2 text-sm font-medium text-ink">
                          In short: {detail.in_short}
                        </p>
                      )}
                      <p className="mt-3 max-w-prose text-sm text-ink">
                        {detail?.body ?? p.narrative}
                      </p>
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
                      <p className="mt-3 text-sm text-ink">
                        <span className="font-medium">Recommended focus:</span>{" "}
                        {detail?.recommended_focus ?? p.recommended_action}
                      </p>
                    </div>
                  </div>
                </article>
              );
              })}
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
