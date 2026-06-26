export type SegmentInput = {
  PURCHASES: number;
  ONEOFF_PURCHASES: number;
  INSTALLMENTS_PURCHASES: number;
  CASH_ADVANCE: number;
  PURCHASES_FREQUENCY: number;
  ONEOFF_PURCHASES_FREQUENCY: number;
  CASH_ADVANCE_FREQUENCY: number;
  CASH_ADVANCE_TRX: number;
  PURCHASES_TRX: number;
  BALANCE: number;
  BALANCE_FREQUENCY: number;
  CREDIT_LIMIT: number;
  PAYMENTS: number;
  MINIMUM_PAYMENTS: number;
  PRC_FULL_PAYMENT: number;
  TENURE: number;
};

export type SegmentResult = {
  cluster_id: number;
  segment_name: string;
  recommended_action: string;
  derived: {
    utilization_rate: number;
    payment_to_min_ratio: number;
    full_payer_flag: number;
  };
  pca: { x: number; y: number };
};

export type ClusterPoint = {
  x: number;
  y: number;
  cluster_id: number;
  balance: number;
  credit_limit: number;
  persona_name: string;
};

export type PersonaRow = {
  cluster_id: number;
  persona_name: string;
  customer_count: number;
  pct_of_base: number;
  recommended_action: string;
  mean_balance: number;
  mean_credit_limit: number;
  mean_utilization: number;
  mean_purchases: number;
};

export type ModelMetadata = {
  best_model: string;
  init_method: string;
  n_clusters: number;
  feature_names: string[];
  log1p_columns: string[];
  metrics: Record<string, Record<string, number>>;
  persona_map: Record<string, string>;
  persona_actions: Record<string, string>;
  k_voting_summary?: KVoteRow[];
};

export type KVoteRow = {
  k: number;
  silhouette: number;
  davies_bouldin: number;
  calinski_harabasz: number;
  rank_silhouette: number;
  rank_davies_bouldin: number;
  rank_calinski_harabasz: number;
  Total_Rank: number;
};

export type AlgorithmRow = {
  model: string;
  silhouette: number | null;
  davies_bouldin: number | null;
  calinski_harabasz: number | null;
  n_clusters: number | null;
  noise_pct: number | null;
  rank_db: number | null;
  rank_sil: number | null;
  composite_rank: number | null;
};

export type ModelPersonaDetail = {
  cluster_id: number;
  persona_name: string;
  customer_count: number;
  pct_of_base: number;
  recommended_action: string;
  high_features: string[];
  low_features: string[];
  narrative: string;
  profile_means: Record<string, number>;
  profile_z: Record<string, number>;
};

export type ModelDetails = {
  overview: {
    best_model: string;
    init_method: string;
    n_clusters: number;
    silhouette: number | null;
    davies_bouldin: number | null;
    calinski_harabasz: number | null;
    customer_count: number;
    feature_count: number;
    log1p_count: number;
  };
  dataset: {
    source: string;
    raw_rows: number;
    raw_columns: number;
    working_columns: number;
    duplicate_rows: number;
    missing_values: { column: string; count: number }[];
    cleaning_notes: string[];
  };
  features: {
    api_input_count: number;
    model_features: string[];
    log1p_columns: string[];
    engineered_features: string[];
    groups: {
      spending: string[];
      account: string[];
      engineered: string[];
    };
  };
  zero_inflation: { feature: string; zero_pct: number }[];
  correlation: {
    features: string[];
    matrix: number[][];
  };
  k_voting: KVoteRow[];
  algorithm_comparison: AlgorithmRow[];
  personas: ModelPersonaDetail[];
  pipeline_steps: string[];
};

export type SampleMode = "default" | "random" | "persona";
