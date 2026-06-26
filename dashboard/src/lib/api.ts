import type {
  ClusterPoint,
  ModelDetails,
  ModelMetadata,
  PersonaRow,
  SampleMode,
  SegmentInput,
  SegmentResult,
} from "./types";

/** Empty base = same-origin; Next.js rewrites `/api/v1/*` → FastAPI (no CORS in dev). */
function apiBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return "";
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function predictSegment(input: SegmentInput): Promise<SegmentResult> {
  return fetchJson<SegmentResult>("/api/v1/segment", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function fetchClusterMap(simplified = false): Promise<{
  points: ClusterPoint[];
  persona_map: Record<string, string>;
  total_customers: number;
  simplified: boolean;
}> {
  return fetchJson(`/api/v1/cluster-map?simplified=${simplified}`);
}

export async function fetchPersonas(): Promise<{ personas: PersonaRow[] }> {
  return fetchJson("/api/v1/personas");
}

export async function fetchMetadata(): Promise<ModelMetadata> {
  return fetchJson("/api/v1/metadata");
}

export async function fetchModelDetails(): Promise<ModelDetails> {
  return fetchJson("/api/v1/model-details");
}

export async function fetchSampleCustomer(
  mode: SampleMode = "default",
  clusterId?: number,
): Promise<SegmentInput> {
  const params = new URLSearchParams({ mode });
  if (mode === "persona" && clusterId !== undefined) {
    params.set("cluster_id", String(clusterId));
  }
  return fetchJson(`/api/v1/sample-customer?${params.toString()}`);
}

export const defaultSegmentInput: SegmentInput = {
  PURCHASES: 0,
  ONEOFF_PURCHASES: 0,
  INSTALLMENTS_PURCHASES: 0,
  CASH_ADVANCE: 0,
  PURCHASES_FREQUENCY: 0,
  ONEOFF_PURCHASES_FREQUENCY: 0,
  CASH_ADVANCE_FREQUENCY: 0,
  CASH_ADVANCE_TRX: 0,
  PURCHASES_TRX: 0,
  BALANCE: 0,
  BALANCE_FREQUENCY: 0,
  CREDIT_LIMIT: 1000,
  PAYMENTS: 0,
  MINIMUM_PAYMENTS: 0,
  PRC_FULL_PAYMENT: 0,
  TENURE: 12,
};
