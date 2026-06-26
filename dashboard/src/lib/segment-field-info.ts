import type { SegmentInput } from "./types";

export type SegmentFieldInfo = {
  description: string;
  enter: string;
  range: string;
};

export const SEGMENT_FIELD_INFO: Record<keyof SegmentInput, SegmentFieldInfo> = {
  PURCHASES: {
    description: "Total purchase spend on the card during the statement period.",
    enter: "Dollar amount for all purchases combined (one-off plus installments).",
    range: "0 or greater.",
  },
  ONEOFF_PURCHASES: {
    description: "Portion of purchases paid in full at once (not on an installment plan).",
    enter: "Dollar amount of one-off purchase spend.",
    range: "0 or greater.",
  },
  INSTALLMENTS_PURCHASES: {
    description: "Portion of purchases made on an installment or deferred plan.",
    enter: "Dollar amount of installment purchase spend.",
    range: "0 or greater.",
  },
  CASH_ADVANCE: {
    description: "Cash withdrawn against the credit line (ATM or bank transfer).",
    enter: "Total cash-advance dollar amount in the period.",
    range: "0 or greater.",
  },
  PURCHASES_TRX: {
    description: "Count of purchase transactions in the period.",
    enter: "Whole number of purchase swipes or posted purchase events.",
    range: "0 or greater (integer).",
  },
  CASH_ADVANCE_TRX: {
    description: "Count of cash-advance transactions in the period.",
    enter: "Whole number of cash-advance events.",
    range: "0 or greater (integer).",
  },
  PURCHASES_FREQUENCY: {
    description:
      "How often the customer purchases relative to the period — higher means more active spending months.",
    enter: "Unitless ratio from the CC GENERAL dataset (not a percentage).",
    range: "0 to 1 inclusive.",
  },
  ONEOFF_PURCHASES_FREQUENCY: {
    description: "How often one-off purchases occur relative to the period.",
    enter: "Unitless ratio from the dataset.",
    range: "0 to 1 inclusive.",
  },
  CASH_ADVANCE_FREQUENCY: {
    description: "How often cash advances occur relative to the period.",
    enter: "Unitless ratio from the dataset.",
    range: "0 to 1 inclusive.",
  },
  BALANCE: {
    description: "Outstanding balance carried on the card at the end of the period.",
    enter: "Dollar amount still owed on the account.",
    range: "0 or greater.",
  },
  CREDIT_LIMIT: {
    description: "Maximum credit line approved for the customer.",
    enter: "Total credit limit in dollars. Used with balance to derive utilization.",
    range: "Must be greater than 0.",
  },
  PAYMENTS: {
    description: "Total payments posted to the account in the period.",
    enter: "Sum of all payment dollars applied to the card.",
    range: "0 or greater.",
  },
  MINIMUM_PAYMENTS: {
    description: "Minimum amount due on the statement.",
    enter: "Dollar minimum payment required for the period.",
    range: "0 or greater.",
  },
  BALANCE_FREQUENCY: {
    description: "How often a non-zero balance is carried relative to the period.",
    enter: "Unitless ratio from the dataset.",
    range: "0 to 1 inclusive.",
  },
  PRC_FULL_PAYMENT: {
    description:
      "Share of periods in which the customer paid the balance in full (full-payer behavior).",
    enter: "Proportion of full-payment months — key signal for transactor vs revolver personas.",
    range: "0 to 1 inclusive.",
  },
  TENURE: {
    description: "How long the customer has held the card with the issuer.",
    enter: "Number of months on book.",
    range: "0 to 60 months (integer).",
  },
};
