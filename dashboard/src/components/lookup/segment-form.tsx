"use client";

import type { SegmentInput } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { SampleMenu, type SampleOption } from "@/components/lookup/sample-menu";
import { FieldInfoTooltip } from "@/components/lookup/field-info-tooltip";
import { SEGMENT_FIELD_INFO } from "@/lib/segment-field-info";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SegmentFormProps = {
  values: SegmentInput;
  onChange: (values: SegmentInput) => void;
  onSubmit: () => void;
  onLoadSample: (option: SampleOption) => void;
  loading: boolean;
  errors: Partial<Record<keyof SegmentInput, string>>;
};

type FieldDef = {
  key: keyof SegmentInput;
  label: string;
  step?: string;
  min?: number;
  max?: number;
};

const SPENDING_FIELDS: FieldDef[] = [
  { key: "PURCHASES", label: "Purchases", step: "any", min: 0 },
  { key: "ONEOFF_PURCHASES", label: "One-off purchases", step: "any", min: 0 },
  { key: "INSTALLMENTS_PURCHASES", label: "Installment purchases", step: "any", min: 0 },
  { key: "CASH_ADVANCE", label: "Cash advance", step: "any", min: 0 },
  { key: "PURCHASES_TRX", label: "Purchase transactions", step: "1", min: 0 },
  { key: "CASH_ADVANCE_TRX", label: "Cash advance transactions", step: "1", min: 0 },
  { key: "PURCHASES_FREQUENCY", label: "Purchases frequency", step: "any", min: 0, max: 1 },
  { key: "ONEOFF_PURCHASES_FREQUENCY", label: "One-off frequency", step: "any", min: 0, max: 1 },
  { key: "CASH_ADVANCE_FREQUENCY", label: "Cash advance frequency", step: "any", min: 0, max: 1 },
];

const ACCOUNT_FIELDS: FieldDef[] = [
  { key: "BALANCE", label: "Balance", step: "any", min: 0 },
  { key: "CREDIT_LIMIT", label: "Credit limit", step: "any", min: 0.01 },
  { key: "PAYMENTS", label: "Payments", step: "any", min: 0 },
  { key: "MINIMUM_PAYMENTS", label: "Minimum payments", step: "any", min: 0 },
  { key: "BALANCE_FREQUENCY", label: "Balance frequency", step: "any", min: 0, max: 1 },
  { key: "PRC_FULL_PAYMENT", label: "Full payment ratio", step: "any", min: 0, max: 1 },
  { key: "TENURE", label: "Tenure (months)", step: "1", min: 0, max: 60 },
];

function FieldGrid({
  title,
  fields,
  values,
  onChange,
  errors,
}: {
  title: string;
  fields: FieldDef[];
  values: SegmentInput;
  onChange: (v: SegmentInput) => void;
  errors: Partial<Record<keyof SegmentInput, string>>;
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-semibold text-ink">{title}</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label htmlFor={field.key}>{field.label}</Label>
              <FieldInfoTooltip
                label={field.label}
                info={SEGMENT_FIELD_INFO[field.key]}
              />
            </div>
            <Input
              id={field.key}
              type="number"
              step={field.step}
              min={field.min}
              max={field.max}
              value={values[field.key]}
              onChange={(e) =>
                onChange({
                  ...values,
                  [field.key]:
                    field.key === "TENURE"
                      ? parseInt(e.target.value, 10) || 0
                      : parseFloat(e.target.value) || 0,
                })
              }
              aria-invalid={!!errors[field.key]}
              aria-describedby={errors[field.key] ? `${field.key}-err` : undefined}
            />
            {errors[field.key] && (
              <p id={`${field.key}-err`} className="text-xs text-[oklch(0.5_0.16_25)]">
                {errors[field.key]}
              </p>
            )}
          </div>
        ))}
      </div>
    </fieldset>
  );
}

export function SegmentForm({
  values,
  onChange,
  onSubmit,
  onLoadSample,
  loading,
  errors,
}: SegmentFormProps) {
  return (
    <form
      className="space-y-8"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <FieldGrid
        title="Spending behavior"
        fields={SPENDING_FIELDS}
        values={values}
        onChange={onChange}
        errors={errors}
      />
      <FieldGrid
        title="Account & payments"
        fields={ACCOUNT_FIELDS}
        values={values}
        onChange={onChange}
        errors={errors}
      />
      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <Button type="submit" disabled={loading}>
          {loading ? "Running segmentation…" : "Run segmentation"}
        </Button>
        <SampleMenu onSelect={onLoadSample} loading={loading} />
      </div>
    </form>
  );
}

export function validateSegmentInput(values: SegmentInput): Partial<Record<keyof SegmentInput, string>> {
  const errors: Partial<Record<keyof SegmentInput, string>> = {};
  if (values.CREDIT_LIMIT <= 0) {
    errors.CREDIT_LIMIT = "Credit limit must be greater than zero.";
  }
  const freqKeys: (keyof SegmentInput)[] = [
    "PURCHASES_FREQUENCY",
    "ONEOFF_PURCHASES_FREQUENCY",
    "CASH_ADVANCE_FREQUENCY",
    "BALANCE_FREQUENCY",
    "PRC_FULL_PAYMENT",
  ];
  for (const key of freqKeys) {
    const v = values[key] as number;
    if (v < 0 || v > 1) {
      errors[key] = "Must be between 0 and 1.";
    }
  }
  if (values.TENURE < 0 || values.TENURE > 60) {
    errors.TENURE = "Tenure must be 0–60 months.";
  }
  return errors;
}
