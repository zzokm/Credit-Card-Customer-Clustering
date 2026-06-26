export const BUSINESS_QUESTIONS = [
  {
    title: "Credit-limit policy",
    question: "Which clusters warrant limit increases vs. risk holds?",
  },
  {
    title: "Micro-loan eligibility",
    question: "Which segments combine payment discipline with purchase velocity?",
  },
  {
    title: "Dormant risk",
    question:
      "How do zero-balance accounts differ — dormancy vs. healthy repayment vs. pre-churn?",
  },
  {
    title: "Cash-advance exposure",
    question: "Which groups need automated risk flags or higher APR tiers?",
  },
  {
    title: "Engagement–risk gap",
    question: "Where is high balance frequency but low purchase activity?",
  },
  {
    title: "Stress profiles",
    question: "Can extreme payment skew trigger enhanced due diligence?",
  },
] as const;

export type FeatureDefinition = {
  column: string;
  definition: string;
};

export const RAW_FEATURE_DEFINITIONS: FeatureDefinition[] = [
  {
    column: "CUST_ID",
    definition: "The unique identification number for each credit card holder.",
  },
  {
    column: "BALANCE",
    definition:
      "The outstanding amount of money left on the card that the customer currently owes.",
  },
  {
    column: "BALANCE_FREQUENCY",
    definition:
      "A score between 0 and 1 showing how frequently the balance is updated. A score of 1 means the balance updates daily/regularly, while 0 means it rarely changes.",
  },
  {
    column: "PURCHASES",
    definition: "The total dollar amount of all purchases made from the account.",
  },
  {
    column: "ONEOFF_PURCHASES",
    definition:
      'The maximum single-payment purchase amount made. Think of this as buying an item in full upfront (e.g., a one-time laptop purchase).',
  },
  {
    column: "INSTALLMENTS_PURCHASES",
    definition:
      "The total amount spent on purchases that are paid off in monthly installments or payment plans.",
  },
  {
    column: "CASH_ADVANCE",
    definition: "The total amount of cash withdrawn from an ATM using the credit card.",
  },
  {
    column: "PURCHASES_FREQUENCY",
    definition:
      "A score between 0 and 1 indicating how frequently purchases are being made (1 = constantly shopping, 0 = never shopping).",
  },
  {
    column: "ONEOFF_PURCHASES_FREQUENCY",
    definition:
      'A score between 0 and 1 indicating how frequently "one-off" (single payment) purchases happen.',
  },
  {
    column: "PURCHASES_INSTALLMENTS_FREQUENCY",
    definition:
      "A score between 0 and 1 indicating how frequently installment-based purchases are made.",
  },
  {
    column: "CASH_ADVANCE_FREQUENCY",
    definition:
      "A score between 0 and 1 indicating how frequently the customer uses the card to withdraw cash from an ATM.",
  },
  {
    column: "CASH_ADVANCE_TRX",
    definition:
      "The exact number of cash advance transactions made (count of ATM visits).",
  },
  {
    column: "PURCHASES_TRX",
    definition: "The exact number of purchase transactions made.",
  },
  {
    column: "CREDIT_LIMIT",
    definition: "The maximum credit line allowed for the user (their spending cap).",
  },
  {
    column: "PAYMENTS",
    definition:
      "The total amount of money paid by the user toward their credit card bill during the specified timeframe.",
  },
  {
    column: "MINIMUM_PAYMENTS",
    definition:
      "The minimum amount the user was required to pay to keep the account active and avoid penalties.",
  },
  {
    column: "PRC_FULL_PAYMENT",
    definition:
      "The percentage of the full bill paid off by the user. A value of 1 means they pay their entire statement balance off to zero every month; a low value means they carry debt over.",
  },
  {
    column: "TENURE",
    definition:
      "The number of months the customer has held a credit card relationship with the bank.",
  },
];

export type EngineeredFeature = {
  name: string;
  formula: string;
  meaning: string;
  simple: string;
  useful: string;
};

export const ENGINEERED_FEATURES: EngineeredFeature[] = [
  {
    name: "UTILIZATION_RATE",
    formula: "balance ÷ credit limit (capped 0–1)",
    meaning: "Credit usage intensity for limit decisions",
    simple:
      "How much of the approved credit line is currently in use — like a fuel gauge for the card.",
    useful:
      "High utilization flags customers near their limit (risk hold). Low utilization suggests room for a limit increase or dormant behavior.",
  },
  {
    name: "AVG_PURCHASE_VALUE",
    formula: "purchases ÷ purchase transaction count",
    meaning: "Spend per transaction — micro-loan sizing",
    simple: "The average dollar amount per swipe or purchase event.",
    useful:
      "Separates frequent small spenders from occasional big-ticket buyers — helps size micro-loans and installment offers.",
  },
  {
    name: "PAYMENT_TO_MIN_RATIO",
    formula: "payments ÷ minimum payment (capped)",
    meaning: "Payment discipline / stress signal",
    simple:
      "How many times over the minimum due the customer actually paid (1× = paid only the minimum).",
    useful:
      "Values near 1 suggest payment stress or revolver behavior. Higher ratios indicate stronger repayment capacity.",
  },
  {
    name: "full_payer_flag",
    formula: "1 if PRC_FULL_PAYMENT > 0, else 0",
    meaning: "Ever paid statement in full",
    simple: "Whether the customer has paid the full balance at least once in the period.",
    useful:
      "Quick binary split between transactors (pay in full sometimes) and chronic balance carriers.",
  },
];

export const CLUSTERING_ALGORITHMS = [
  {
    name: "K-Means++",
    type: "Centroid-based",
    summary:
      "Splits customers into k groups by minimizing distance to cluster centers. Uses k-means++ initialization for stable, spread-out starting points.",
    strengths: [
      "Fast on 8,950 customers",
      "Supports .predict() for new customers via API",
      "Produces exactly k=3 operational segments",
      "No noise/outlier label — every customer gets a persona",
    ],
    weaknesses: [
      "Assumes roughly spherical clusters",
      "Must choose k in advance (we use multi-metric voting)",
    ],
    deployed: true,
  },
  {
    name: "DBSCAN",
    type: "Density-based",
    summary:
      "Groups points that are densely packed; marks sparse regions as noise (label −1). Tuned via k-distance graph for eps and min_samples.",
    strengths: [
      "Finds irregular cluster shapes",
      "Explicitly flags outliers as noise",
      "Best Davies–Bouldin score in our comparison (lowest overlap)",
    ],
    weaknesses: [
      "~4% of customers labeled noise — hard to action in CRM",
      "Only found 2 dense clusters on this data",
      "No simple .predict() for production scoring",
    ],
    deployed: false,
  },
  {
    name: "Agglomerative (Ward)",
    type: "Hierarchical",
    summary:
      "Bottom-up merging: starts with each customer alone, repeatedly merges the pair that least increases within-cluster variance. Dendrogram shows merge history.",
    strengths: [
      "Interpretable merge tree (dendrogram)",
      "Compact, balanced clusters with k=3",
      "Same k as K-Means for fair comparison",
    ],
    weaknesses: [
      "Slow to update with new customers",
      "No native real-time .predict() like K-Means",
      "Lowest silhouette among the three",
    ],
    deployed: false,
  },
] as const;

export const METRIC_DEFINITIONS = [
  {
    name: "Silhouette score",
    direction: "Higher is better",
    range: "Roughly −1 to +1",
    explanation:
      "Measures whether each customer is closer to their own cluster than to neighboring clusters. Higher = tighter, well-separated segments.",
  },
  {
    name: "Davies–Bouldin index",
    direction: "Lower is better",
    range: "Typically ~1–3 on this dataset",
    explanation:
      "Measures cluster overlap — how much segments blur into each other. Lower = compact groups far from their neighbors.",
  },
  {
    name: "Calinski–Harabasz index",
    direction: "Higher is better",
    range: "Can be in the thousands (scales with sample size)",
    explanation:
      "Ratio of between-cluster spread to within-cluster tightness. Higher = cluster centers are far apart and groups are dense.",
  },
  {
    name: "Noise %",
    direction: "Lower is usually better for operations",
    range: "0–100%",
    explanation:
      "Share of customers DBSCAN could not assign to a cluster. K-Means and Agglomerative always assign 100% of customers.",
  },
  {
    name: "Composite rank",
    direction: "Lower is better",
    range: "Sum of silhouette rank + Davies–Bouldin rank",
    explanation:
      "Quick combined score used in the notebook. K-Means and DBSCAN tied at 3.0; deployed model chosen for .predict() support.",
  },
] as const;
