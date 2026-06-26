export type PersonaDetail = {
  cluster_id: number;
  short_label: string;
  in_short: string;
  body: string;
  recommended_focus: string;
  priority: string;
};

export const PERSONA_DETAILS: Record<number, PersonaDetail> = {
  0: {
    cluster_id: 0,
    short_label: "Dormant / Inactive",
    in_short:
      "Quiet accounts that may be dormant, paid off, or only occasionally active.",
    body:
      "These customers barely use their card. Average balances are very low and they typically use only about 5% of their credit limit. Purchase activity exists but is modest — they are not active transactors and they rarely rely on cash advances.",
    recommended_focus:
      "Re-engagement campaigns, dormancy alerts, and light-touch offers — not aggressive credit-limit increases.",
    priority: "Re-engage",
  },
  1: {
    cluster_id: 1,
    short_label: "Active Transactors",
    in_short: "Regular, responsible spenders — the segment you want to grow.",
    body:
      "This is the healthiest spending segment. They purchase frequently, carry higher limits, and make substantial payments. Utilization sits around 36% — engaged but not maxed out. Full-payment behavior is stronger here than in the other groups.",
    recommended_focus:
      "Credit-limit increases, loyalty programs, and targeted micro-loan or installment offers.",
    priority: "Grow & reward",
  },
  2: {
    cluster_id: 2,
    short_label: "Revolvers (High-Risk)",
    in_short:
      "Credit-dependent customers who need careful monitoring, not promotional limit bumps.",
    body:
      "This is the largest segment and the highest-risk profile. Customers carry high balances, use about 65% of their limit, depend heavily on cash advances, and almost never pay the full balance. Low purchase frequency combined with high revolving debt signals financial stress.",
    recommended_focus:
      "Limit holds, higher APR tiers, cash-advance monitoring, and enhanced risk review.",
    priority: "Monitor & protect",
  },
};

export const PERSONA_OVERVIEW_INTRO =
  "K-Means grouped 8,950 customers into 3 segments. Each cluster behaves differently with respect to spending, payments, and credit usage. Persona names are matched automatically from cluster profiles — if you re-run the notebook on updated data, cluster IDs or percentages may shift, but the behavioral logic stays the same.";
