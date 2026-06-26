"use client";

import { useCallback, useState } from "react";
import {
  defaultSegmentInput,
  fetchSampleCustomer,
  predictSegment,
} from "@/lib/api";
import type { SegmentInput, SegmentResult } from "@/lib/types";
import type { SampleOption } from "@/components/lookup/sample-menu";
import { normalizeSegmentInput } from "@/lib/normalize-segment-input";
import { SegmentForm, validateSegmentInput } from "@/components/lookup/segment-form";
import { SegmentResultPanel } from "@/components/lookup/segment-result";
import { VisaCard } from "@/components/lookup/visa-card";
import { useSegmentHighlight } from "@/context/segment-highlight-context";

export function LookupPageClient() {
  const [values, setValues] = useState<SegmentInput>(defaultSegmentInput);
  const [errors, setErrors] = useState<Partial<Record<keyof SegmentInput, string>>>({});
  const [result, setResult] = useState<SegmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pulseTick, setPulseTick] = useState(0);
  const { setHighlight } = useSegmentHighlight();

  const runSegmentation = useCallback(async () => {
    const validation = validateSegmentInput(values);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setLoading(true);
    setError(null);
    try {
      const res = await predictSegment(values);
      setResult(res);
      setHighlight(res);
      setPulseTick((t) => t + 1);
    } catch {
      setResult(null);
      setError(
        "Segmentation service unavailable. Check that the API is running on port 8001.",
      );
    } finally {
      setLoading(false);
    }
  }, [values, setHighlight]);

  const loadSample = useCallback(async (option: SampleOption) => {
    setLoading(true);
    setError(null);
    try {
      const sample = normalizeSegmentInput(await fetchSampleCustomer(option.mode, option.clusterId));
      setValues(sample);
      setErrors({});
    } catch {
      setError("Could not load sample customer from API.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="space-y-8">
      <header className="max-w-2xl">
        <h1 className="text-2xl font-semibold text-ink text-balance">Segment lookup</h1>
        <p className="mt-2 max-w-prose text-sm text-muted">
          Enter raw customer features. The API applies the same engineering, log1p
          transform, and scaling as the notebook before K-Means++ assignment.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="min-w-0 rounded-lg border border-border bg-canvas p-5 sm:p-6">
          <SegmentForm
            values={values}
            onChange={setValues}
            onSubmit={() => void runSegmentation()}
            onLoadSample={(opt) => void loadSample(opt)}
            loading={loading}
            errors={errors}
          />
        </div>
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <VisaCard
            clusterId={result?.cluster_id ?? null}
            segmentName={result?.segment_name}
            loading={loading && !result}
            pulseTick={pulseTick}
          />
          <SegmentResultPanel result={result} error={error} />
        </aside>
      </div>
    </div>
  );
}
