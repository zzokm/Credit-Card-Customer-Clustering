"use client";

import { useEffect, useState } from "react";
import { fetchPersonas } from "@/lib/api";
import type { PersonaRow } from "@/lib/types";
import { personaColor } from "@/lib/personas";
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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink text-balance">Persona profiles</h1>
        <p className="mt-2 max-w-prose text-sm text-muted">
          Aggregated segment statistics from the cleaned dataset. Click a row for
          recommended FinTech actions.
        </p>
      </header>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border bg-surface">
            <tr>
              <th className="px-4 py-3 font-medium text-muted">Cluster</th>
              <th className="px-4 py-3 font-medium text-muted">Persona</th>
              <th className="px-4 py-3 font-medium text-muted text-right">Customers</th>
              <th className="px-4 py-3 font-medium text-muted text-right">% base</th>
              <th className="px-4 py-3 font-medium text-muted text-right">Avg utilization</th>
              <th className="px-4 py-3 font-medium text-muted text-right">Avg purchases</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
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
                <td className="px-4 py-3 text-right font-mono tabular-nums text-ink">
                  {(row.mean_utilization * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-ink">
                  ${row.mean_purchases.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.persona_name ?? "Persona"}
      >
        {selected && (
          <div className="space-y-4 text-sm">
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
            </dl>
          </div>
        )}
      </Sheet>
    </div>
  );
}
