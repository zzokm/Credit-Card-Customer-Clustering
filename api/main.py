"""FastAPI backend for credit card customer segmentation."""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from config import settings
from inference import store


class SegmentRequest(BaseModel):
    PURCHASES: float = Field(ge=0)
    ONEOFF_PURCHASES: float = Field(ge=0)
    INSTALLMENTS_PURCHASES: float = Field(ge=0)
    CASH_ADVANCE: float = Field(ge=0)
    PURCHASES_FREQUENCY: float = Field(ge=0, le=1)
    ONEOFF_PURCHASES_FREQUENCY: float = Field(ge=0, le=1)
    CASH_ADVANCE_FREQUENCY: float = Field(ge=0, le=1)
    CASH_ADVANCE_TRX: float = Field(ge=0)
    PURCHASES_TRX: float = Field(ge=0)
    BALANCE: float = Field(ge=0)
    BALANCE_FREQUENCY: float = Field(ge=0, le=1)
    CREDIT_LIMIT: float = Field(gt=0)
    PAYMENTS: float = Field(ge=0)
    MINIMUM_PAYMENTS: float = Field(ge=0)
    PRC_FULL_PAYMENT: float = Field(ge=0, le=1)
    TENURE: int = Field(ge=0, le=60)


@asynccontextmanager
async def lifespan(_: FastAPI):
    store.load()
    yield


app = FastAPI(
    title="Segment Console API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=settings.cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
@app.get("/api/v1/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/predict")
def predict_legacy(body: SegmentRequest) -> dict[str, Any]:
    """Legacy alias for older clients."""
    return segment(body)


@app.post("/api/v1/segment")
def segment(body: SegmentRequest) -> dict[str, Any]:
    try:
        return store.predict(body.model_dump())
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/api/v1/cluster-map")
def cluster_map(
    simplified: bool = Query(False, description="Return ~2000 downsampled points for performance"),
) -> dict[str, Any]:
    points = store.cluster_map_points(simplified=simplified)
    return {
        "points": points,
        "persona_map": {str(k): v for k, v in store.persona_map.items()},
        "total_customers": len(store.df),
        "simplified": simplified,
    }


@app.get("/api/v1/personas")
def personas() -> dict[str, Any]:
    return {"personas": store.persona_aggregates()}


@app.get("/api/v1/metadata")
def metadata() -> dict[str, Any]:
    return store.metadata


@app.get("/api/v1/model-details")
def model_details() -> dict[str, Any]:
    try:
        return store.model_details()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/api/v1/sample-customer")
def sample_customer(
    mode: str = Query(
        "default",
        description="default | random | persona",
        pattern="^(default|random|persona)$",
    ),
    cluster_id: int | None = Query(None, ge=0, le=10),
) -> dict[str, float]:
    try:
        return store.sample_customer(mode=mode, cluster_id=cluster_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
