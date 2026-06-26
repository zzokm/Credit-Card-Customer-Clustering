import type { SegmentInput } from "./types";

const INT_KEYS = ["PURCHASES_TRX", "CASH_ADVANCE_TRX", "TENURE"] as const;
const FREQ_KEYS = [
  "PURCHASES_FREQUENCY",
  "ONEOFF_PURCHASES_FREQUENCY",
  "CASH_ADVANCE_FREQUENCY",
  "BALANCE_FREQUENCY",
  "PRC_FULL_PAYMENT",
] as const;

/** Align API sample rows with form number-input constraints. */
export function normalizeSegmentInput(sample: SegmentInput): SegmentInput {
  const out = { ...sample };
  for (const key of INT_KEYS) {
    out[key] = Math.round(sample[key]);
  }
  for (const key of FREQ_KEYS) {
    out[key] = Math.round(sample[key] * 10000) / 10000;
  }
  const moneyKeys = (
    Object.keys(sample) as (keyof SegmentInput)[]
  ).filter((k) => !INT_KEYS.includes(k as (typeof INT_KEYS)[number]) && !FREQ_KEYS.includes(k as (typeof FREQ_KEYS)[number]));
  for (const key of moneyKeys) {
    out[key] = Math.round(sample[key] * 100) / 100;
  }
  return out;
}
