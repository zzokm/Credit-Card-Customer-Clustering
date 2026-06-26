"""Inference pipeline mirroring the Jupyter notebook artifacts."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ARTIFACTS_DIR = Path(os.getenv("ARTIFACTS_DIR", str(PROJECT_ROOT / "artifacts")))

PERSONA_DEFINITIONS: dict[str, dict[str, list[str]]] = {
    "The Active Transactors": {
        "high": ["PURCHASES_FREQUENCY", "PRC_FULL_PAYMENT", "PURCHASES_TRX"],
        "low": ["CASH_ADVANCE", "CASH_ADVANCE_FREQUENCY"],
    },
    "The Revolvers (High-Risk)": {
        "high": ["BALANCE", "CASH_ADVANCE", "CASH_ADVANCE_FREQUENCY", "UTILIZATION_RATE"],
        "low": ["PRC_FULL_PAYMENT"],
    },
    "The Big Ticket Spenders": {
        "high": ["CREDIT_LIMIT", "PURCHASES", "ONEOFF_PURCHASES"],
        "low": ["PURCHASES_FREQUENCY"],
    },
    "The Dormant/Inactive": {
        "high": [],
        "low": ["BALANCE", "PURCHASES", "PURCHASES_FREQUENCY", "PAYMENTS", "PURCHASES_TRX"],
    },
}

CORRELATION_FEATURES = [
    "PURCHASES",
    "CASH_ADVANCE",
    "BALANCE",
    "CREDIT_LIMIT",
    "PAYMENTS",
    "PRC_FULL_PAYMENT",
    "PURCHASES_FREQUENCY",
    "UTILIZATION_RATE",
]

PROFILE_CHART_FEATURES = [
    "PURCHASES",
    "BALANCE",
    "UTILIZATION_RATE",
    "PRC_FULL_PAYMENT",
    "CASH_ADVANCE",
    "CREDIT_LIMIT",
]

RAW_SAMPLE_FIELDS = [
    "PURCHASES",
    "ONEOFF_PURCHASES",
    "INSTALLMENTS_PURCHASES",
    "CASH_ADVANCE",
    "PURCHASES_FREQUENCY",
    "ONEOFF_PURCHASES_FREQUENCY",
    "CASH_ADVANCE_FREQUENCY",
    "CASH_ADVANCE_TRX",
    "PURCHASES_TRX",
    "BALANCE",
    "BALANCE_FREQUENCY",
    "CREDIT_LIMIT",
    "PAYMENTS",
    "MINIMUM_PAYMENTS",
    "PRC_FULL_PAYMENT",
    "TENURE",
]

SAMPLE_INT_FIELDS = frozenset({"PURCHASES_TRX", "CASH_ADVANCE_TRX", "TENURE"})
SAMPLE_FREQ_FIELDS = frozenset({
    "PURCHASES_FREQUENCY",
    "ONEOFF_PURCHASES_FREQUENCY",
    "CASH_ADVANCE_FREQUENCY",
    "BALANCE_FREQUENCY",
    "PRC_FULL_PAYMENT",
})


def normalize_sample_fields(row: pd.Series) -> dict[str, float]:
    """Round dataset rows so UI number inputs pass HTML step validation."""
    out: dict[str, float] = {}
    for field in RAW_SAMPLE_FIELDS:
        if field not in row.index:
            continue
        value = float(row[field])
        if field in SAMPLE_INT_FIELDS:
            out[field] = float(int(round(value)))
        elif field in SAMPLE_FREQ_FIELDS:
            out[field] = round(value, 4)
        else:
            out[field] = round(value, 2)
    return out


def safe_divide(num: np.ndarray | pd.Series, den: np.ndarray | pd.Series) -> np.ndarray:
    return np.where(den == 0, 0.0, num / den)


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out["UTILIZATION_RATE"] = np.clip(safe_divide(out["BALANCE"], out["CREDIT_LIMIT"]), 0, 1)
    out["AVG_PURCHASE_VALUE"] = safe_divide(out["PURCHASES"], out["PURCHASES_TRX"])
    out["PAYMENT_TO_MIN_RATIO"] = np.clip(safe_divide(out["PAYMENTS"], out["MINIMUM_PAYMENTS"]), 0, 10)
    if "full_payer_flag" not in out.columns:
        out["full_payer_flag"] = (out["PRC_FULL_PAYMENT"] > 0).astype(int)
    return out


def apply_log1p(df: pd.DataFrame, columns: list[str]) -> pd.DataFrame:
    out = df.copy()
    for col in columns:
        if col in out.columns:
            out[col] = np.log1p(np.clip(out[col], a_min=0, a_max=None))
    return out


class ArtifactStore:
    def __init__(self) -> None:
        self.model = None
        self.scaler = None
        self.pca = None
        self.feature_names: list[str] = []
        self.log1p_columns: list[str] = []
        self.metadata: dict[str, Any] = {}
        self.persona_map: dict[int, str] = {}
        self.persona_actions: dict[str, str] = {}
        self._df: pd.DataFrame | None = None
        self._map_cache: dict[str, list[dict[str, Any]]] = {}
        self._model_details_cache: dict[str, Any] | None = None

    def load(self) -> None:
        self.model = joblib.load(ARTIFACTS_DIR / "models" / "best_clustering_model.joblib")
        self.scaler = joblib.load(ARTIFACTS_DIR / "transformers" / "scaler.joblib")
        self.pca = joblib.load(ARTIFACTS_DIR / "transformers" / "pca.joblib")
        with open(ARTIFACTS_DIR / "transformers" / "selected_features.json", encoding="utf-8") as f:
            self.feature_names = json.load(f)
        with open(ARTIFACTS_DIR / "metadata.json", encoding="utf-8") as f:
            self.metadata = json.load(f)
        self.log1p_columns = self.metadata.get("log1p_columns", [])
        self.persona_map = {int(k): v for k, v in self.metadata.get("persona_map", {}).items()}
        self.persona_actions = self.metadata.get("persona_actions", {})
        self._df = pd.read_csv(ARTIFACTS_DIR / "data" / "cleaned_dataset.csv")
        self._map_cache["full"] = self._build_cluster_map_points(None)
        self._map_cache["simplified"] = self._build_cluster_map_points(2000)
        self._model_details_cache = self._build_model_details()

    @property
    def df(self) -> pd.DataFrame:
        if self._df is None:
            raise RuntimeError("Artifacts not loaded")
        return self._df

    def predict(self, raw: dict[str, float]) -> dict[str, Any]:
        row = engineer_features(pd.DataFrame([raw]))
        derived = {
            "utilization_rate": float(row["UTILIZATION_RATE"].iloc[0]),
            "payment_to_min_ratio": float(row["PAYMENT_TO_MIN_RATIO"].iloc[0]),
            "full_payer_flag": int(row["full_payer_flag"].iloc[0]),
        }
        processed = apply_log1p(row, self.log1p_columns)
        x = processed[self.feature_names]
        x_scaled = self.scaler.transform(x)
        cluster_id = int(self.model.predict(x_scaled)[0])
        segment_name = self.persona_map.get(cluster_id, f"Cluster {cluster_id}")
        recommended_action = self.persona_actions.get(segment_name, "")
        pca_coords = self.pca.transform(x_scaled)[0]
        return {
            "cluster_id": cluster_id,
            "segment_name": segment_name,
            "recommended_action": recommended_action,
            "derived": derived,
            "pca": {"x": float(pca_coords[0]), "y": float(pca_coords[1])},
        }

    def _build_cluster_map_points(self, max_points: int | None) -> list[dict[str, Any]]:
        df = self.df.copy()
        engineered = engineer_features(df)
        processed = apply_log1p(engineered, self.log1p_columns)
        x = processed[self.feature_names]
        x_scaled = self.scaler.transform(x)
        coords = self.pca.transform(x_scaled)
        if max_points and len(coords) > max_points:
            idx = np.linspace(0, len(coords) - 1, max_points, dtype=int)
            coords = coords[idx]
            engineered = engineered.iloc[idx]
        points = []
        for i in range(len(coords)):
            cluster_id = int(engineered.iloc[i]["cluster_label"])
            points.append(
                {
                    "x": float(coords[i, 0]),
                    "y": float(coords[i, 1]),
                    "cluster_id": cluster_id,
                    "balance": float(engineered.iloc[i]["BALANCE"]),
                    "credit_limit": float(engineered.iloc[i]["CREDIT_LIMIT"]),
                    "persona_name": self.persona_map.get(cluster_id, ""),
                }
            )
        return points

    def cluster_map_points(self, simplified: bool = False) -> list[dict[str, Any]]:
        key = "simplified" if simplified else "full"
        return self._map_cache.get(key, [])

    def persona_aggregates(self) -> list[dict[str, Any]]:
        df = self.df.copy()
        engineered = engineer_features(df)
        total = len(engineered)
        rows = []
        for cluster_id, group in engineered.groupby("cluster_label"):
            cid = int(cluster_id)
            persona = self.persona_map.get(
                cid,
                group["persona_name"].iloc[0] if "persona_name" in group.columns else "",
            )
            rows.append(
                {
                    "cluster_id": cid,
                    "persona_name": persona,
                    "customer_count": int(len(group)),
                    "pct_of_base": round(len(group) / total * 100, 2),
                    "recommended_action": self.persona_actions.get(persona, ""),
                    "mean_balance": round(float(group["BALANCE"].mean()), 2),
                    "mean_credit_limit": round(float(group["CREDIT_LIMIT"].mean()), 2),
                    "mean_utilization": round(float(group["UTILIZATION_RATE"].mean()), 4),
                    "mean_purchases": round(float(group["PURCHASES"].mean()), 2),
                }
            )
        return sorted(rows, key=lambda r: r["cluster_id"])

    def sample_customer(
        self,
        mode: str = "default",
        cluster_id: int | None = None,
    ) -> dict[str, float]:
        df = self.df
        if mode == "random":
            row = df.sample(n=1, random_state=None).iloc[0]
        elif mode == "persona":
            if cluster_id is None:
                raise ValueError("cluster_id is required when mode is persona")
            subset = df[df["cluster_label"] == cluster_id]
            if subset.empty:
                raise ValueError(f"No customers found for cluster {cluster_id}")
            row = subset.sample(n=1, random_state=None).iloc[0]
        else:
            row = df.iloc[0]
        return normalize_sample_fields(row)

    def model_details(self) -> dict[str, Any]:
        if self._model_details_cache is None:
            self._model_details_cache = self._build_model_details()
        return self._model_details_cache

    def _persona_narrative(self, persona_name: str) -> str:
        defs = PERSONA_DEFINITIONS.get(persona_name, {"high": [], "low": []})
        high = defs.get("high", [])
        low = defs.get("low", [])
        parts: list[str] = []
        if high:
            parts.append(f"higher {', '.join(high)}")
        if low:
            parts.append(f"lower {', '.join(low)}")
        if not parts:
            return (
                f"{persona_name} customers show subdued activity across spending and "
                "payment features relative to the portfolio."
            )
        joined = " and ".join(parts)
        return (
            f"Characterized by {joined} relative to other segments in the portfolio."
        )

    def _build_model_details(self) -> dict[str, Any]:
        df = self.df.copy()
        engineered = engineer_features(df)
        total = len(engineered)

        km_metrics = self.metadata.get("metrics", {})
        sil = km_metrics.get("silhouette", {}).get("K-Means")
        db = km_metrics.get("davies_bouldin", {}).get("K-Means")
        ch = km_metrics.get("calinski_harabasz", {}).get("K-Means")

        numeric_cols = [
            c
            for c in engineered.select_dtypes(include=[np.number]).columns
            if c not in ("cluster_label",)
        ]
        zero_rows = []
        for col in numeric_cols:
            zero_pct = float((engineered[col] == 0).mean() * 100)
            zero_rows.append({"feature": col, "zero_pct": round(zero_pct, 2)})
        zero_rows.sort(key=lambda r: r["zero_pct"], reverse=True)

        corr_df = engineered[CORRELATION_FEATURES].corr().round(3)
        corr_features = list(corr_df.columns)
        corr_matrix = corr_df.values.tolist()

        cluster_means = engineered.groupby("cluster_label")[PROFILE_CHART_FEATURES].mean()
        z_profile = cluster_means.apply(
            lambda col: (col - col.mean()) / (col.std() + 1e-9),
        )

        persona_rows = []
        for cluster_id in sorted(self.persona_map.keys()):
            persona = self.persona_map[cluster_id]
            group = engineered[engineered["cluster_label"] == cluster_id]
            defs = PERSONA_DEFINITIONS.get(persona, {"high": [], "low": []})
            means = {
                feat: round(float(cluster_means.loc[cluster_id, feat]), 4)
                for feat in PROFILE_CHART_FEATURES
            }
            z_scores = {
                feat: round(float(z_profile.loc[cluster_id, feat]), 4)
                for feat in PROFILE_CHART_FEATURES
            }
            persona_rows.append(
                {
                    "cluster_id": cluster_id,
                    "persona_name": persona,
                    "customer_count": int(len(group)),
                    "pct_of_base": round(len(group) / total * 100, 2),
                    "recommended_action": self.persona_actions.get(persona, ""),
                    "high_features": defs.get("high", []),
                    "low_features": defs.get("low", []),
                    "narrative": self._persona_narrative(persona),
                    "profile_means": means,
                    "profile_z": z_scores,
                }
            )

        algo_comparison = []
        for model_name in ("K-Means", "DBSCAN", "Agglomerative"):
            algo_comparison.append(
                {
                    "model": model_name,
                    "silhouette": km_metrics.get("silhouette", {}).get(model_name),
                    "davies_bouldin": km_metrics.get("davies_bouldin", {}).get(model_name),
                    "calinski_harabasz": km_metrics.get("calinski_harabasz", {}).get(model_name),
                    "n_clusters": km_metrics.get("n_clusters", {}).get(model_name),
                    "noise_pct": km_metrics.get("noise_pct", {}).get(model_name),
                    "rank_db": km_metrics.get("rank_db", {}).get(model_name),
                    "rank_sil": km_metrics.get("rank_sil", {}).get(model_name),
                    "composite_rank": km_metrics.get("composite_rank", {}).get(model_name),
                }
            )

        spending_features = [
            "PURCHASES",
            "ONEOFF_PURCHASES",
            "INSTALLMENTS_PURCHASES",
            "CASH_ADVANCE",
            "PURCHASES_TRX",
            "CASH_ADVANCE_TRX",
            "PURCHASES_FREQUENCY",
            "ONEOFF_PURCHASES_FREQUENCY",
            "CASH_ADVANCE_FREQUENCY",
        ]
        account_features = [
            "BALANCE",
            "BALANCE_FREQUENCY",
            "CREDIT_LIMIT",
            "PAYMENTS",
            "MINIMUM_PAYMENTS",
            "PRC_FULL_PAYMENT",
            "TENURE",
        ]
        engineered_features = [
            "UTILIZATION_RATE",
            "AVG_PURCHASE_VALUE",
            "PAYMENT_TO_MIN_RATIO",
            "full_payer_flag",
        ]

        return {
            "overview": {
                "best_model": self.metadata.get("best_model", "K-Means"),
                "init_method": self.metadata.get("init_method", "k-means++"),
                "n_clusters": self.metadata.get("n_clusters", 3),
                "silhouette": sil,
                "davies_bouldin": db,
                "calinski_harabasz": ch,
                "customer_count": total,
                "feature_count": len(self.feature_names),
                "log1p_count": len(self.log1p_columns),
            },
            "dataset": {
                "source": "CC GENERAL (Kaggle)",
                "raw_rows": 8950,
                "raw_columns": 18,
                "working_columns": 17,
                "duplicate_rows": 0,
                "missing_values": [
                    {"column": "CREDIT_LIMIT", "count": 1},
                    {"column": "MINIMUM_PAYMENTS", "count": 313},
                ],
                "cleaning_notes": [
                    "Customer ID column dropped after duplicate audit (0 duplicates).",
                    "Missing CREDIT_LIMIT imputed; MINIMUM_PAYMENTS imputed for modeling.",
                    "Exported artifact: cleaned_dataset.csv",
                ],
            },
            "features": {
                "api_input_count": len(RAW_SAMPLE_FIELDS),
                "model_features": self.feature_names,
                "log1p_columns": self.log1p_columns,
                "engineered_features": engineered_features,
                "groups": {
                    "spending": spending_features,
                    "account": account_features,
                    "engineered": engineered_features,
                },
            },
            "zero_inflation": zero_rows[:12],
            "correlation": {
                "features": corr_features,
                "matrix": corr_matrix,
            },
            "k_voting": self.metadata.get("k_voting_summary", []),
            "algorithm_comparison": algo_comparison,
            "personas": persona_rows,
            "pipeline_steps": [
                "Accept 16 raw CC GENERAL fields via API",
                "Engineer UTILIZATION_RATE, AVG_PURCHASE_VALUE, PAYMENT_TO_MIN_RATIO, full_payer_flag",
                "Apply log1p to skewed / zero-inflated columns",
                "Scale with persisted StandardScaler",
                "Predict cluster with K-Means++ (k=3)",
                "Map cluster_id → persona name and recommended FinTech action",
            ],
        }


store = ArtifactStore()
