"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchPersonas } from "@/lib/api";
import type { PersonaRow } from "@/lib/types";
import { personaBg, personaColor } from "@/lib/personas";
import {
  PERSONA_DETAILS,
  PERSONA_OVERVIEW_INTRO,
} from "@/lib/persona-detail-content";
import { Sheet } from "@/components/ui/sheet";

export function PersonasTable() {
  const [rows, setRows] = useState<PersonaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<PersonaRow | null>(null);

  useEffect(() => {
    fetchPersonas()
      .then((data) => setRows(data.personas))
      .catch(() => setError("Could not load persona aggregates."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-muted">Loading persona profiles…</p>;
  }

  if (error) {
    return <p className="text-sm text-ink">{error}</p>;
  }

  const sorted = [...rows].sort((a, b) => a.cluster_id - b.cluster_id);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-semibold text-ink text-balance">Persona profiles</h1>
        <p className="mt-2 max-w-prose text-sm text-muted">{PERSONA_OVERVIEW_INTRO}</p>
      </header>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <caption className="sr-only">Persona aggregates at a glance</caption>
          <thead className="border-b border-border bg-surface">
            <tr>
              <th className="px-4 py-3 font-medium text-muted">Cluster</th>
              <th className="px-4 py-3 font-medium text-muted">Persona</th>
              <th className="px-4 py-3 font-medium text-muted text-right">Customers</th>
              <th className="px-4 py-3 font-medium text-muted text-right">% base</th>
              <th className="px-4 py-3 font-medium text-muted">Priority</th>
              <th className="px-4 py-3 font-medium text-muted text-right">Avg utilization</th>
              <th className="px-4 py-3 font-medium text-muted text-right">Avg purchases</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const detail = PERSONA_DETAILS[row.cluster_id];
              return (
                <tr
                  key={row.cluster_id}
                  className="cursor-pointer border-b border-border/60 transition-colors hover:bg-surface"
                  onClick={() => setSelected(row)}
                >
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex size-2.5 rounded-full"
                      style={{ background: personaColor(row.cluster_id) }}
                      aria-hidden
                    />
                    <span className="ml-2 font-mono text-ink">{row.cluster_id}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-ink">{row.persona_name}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink">
                    {row.customer_count.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink">
                    {row.pct_of_base}%
                  </td>
                  <td className="px-4 py-3 text-ink">{detail?.priority ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-ink">
                    {(row.mean_utilization * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-ink">
                    ${row.mean_purchases.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-ink">Segment deep-dives</h2>
        {sorted.map((row) => {
          const detail = PERSONA_DETAILS[row.cluster_id];
          if (!detail) return null;
          return (
            <article
              key={row.cluster_id}
              className="rounded-lg border border-border p-6"
              style={{ background: personaBg(row.cluster_id) }}
            >
              <div className="flex flex-wrap items-start gap-3">
                <span
                  className="mt-1.5 inline-flex size-3 shrink-0 rounded-full"
                  style={{ background: personaColor(row.cluster_id) }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-ink">
                    Cluster {row.cluster_id} — {row.persona_name}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    {row.customer_count.toLocaleString()} customers · {row.pct_of_base}% of base ·{" "}
                    Priority: {detail.priority}
                  </p>
                  <p className="mt-3 text-sm font-medium text-ink">
                    In short: {detail.in_short}
                  </p>
                  <p className="mt-3 max-w-prose text-sm text-ink">{detail.body}</p>
                  <dl className="mt-5 grid gap-4 border-t border-border/60 pt-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <dt className="text-xs text-muted">Mean balance</dt>
                      <dd className="mt-0.5 font-mono text-sm tabular-nums text-ink">
                        ${row.mean_balance.toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">Mean credit limit</dt>
                      <dd className="mt-0.5 font-mono text-sm tabular-nums text-ink">
                        ${row.mean_credit_limit.toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">Mean utilization</dt>
                      <dd className="mt-0.5 font-mono text-sm tabular-nums text-ink">
                        {(row.mean_utilization * 100).toFixed(1)}%
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">Mean purchases</dt>
                      <dd className="mt-0.5 font-mono text-sm tabular-nums text-ink">
                        ${row.mean_purchases.toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-sm text-ink">
                    <span className="font-medium">Recommended focus:</span>{" "}
                    {detail.recommended_focus}
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    API action string: {row.recommended_action}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <p className="text-sm text-muted">
        <Link href="/model#personas" className="font-medium text-primary hover:underline">
          Model details — persona radar &amp; definitions →
        </Link>
      </p>

      <Sheet
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.persona_name ?? "Persona"}
      >
        {selected && (
          <div className="space-y-4 text-sm">
            {PERSONA_DETAILS[selected.cluster_id] && (
              <>
                <p className="font-medium text-ink">
                  {PERSONA_DETAILS[selected.cluster_id].in_short}
                </p>
                <p className="text-ink">{PERSONA_DETAILS[selected.cluster_id].body}</p>
              </>
            )}
            <p className="text-ink">{selected.recommended_action}</p>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted">Mean balance</dt>
                <dd className="font-mono tabular-nums">
                  ${selected.mean_balance.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Mean credit limit</dt>
                <dd className="font-mono tabular-nums">
                  ${selected.mean_credit_limit.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Utilization</dt>
                <dd className="font-mono tabular-nums">
                  {(selected.mean_utilization * 100).toFixed(1)}%
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Mean purchases</dt>
                <dd className="font-mono tabular-nums">
                  ${selected.mean_purchases.toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </Sheet>
    </div>
  );
}
