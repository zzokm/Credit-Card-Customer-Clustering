# Credit Card Customer Clustering — Segment Console

End-to-end **FinTech customer segmentation**: train clusters in a Jupyter notebook, export ML artifacts, serve predictions through **FastAPI**, and explore results in a **Next.js** analyst dashboard.

**Live demo:** [credit.zokm.me:5465](http://credit.zokm.me:5465)  
**Repository:** [github.com/zzokm/Credit-Card-Customer-Clustering](https://github.com/zzokm/Credit-Card-Customer-Clustering)

---

## What this project does

A credit card issuer has thousands of customers with different spending, payment, and risk profiles. This project:

1. **Cleans and explores** the [CC GENERAL](https://www.kaggle.com/datasets/aristotelisg/ccdata) dataset (8,950 cardholders).
2. **Engineers features** (utilization, payment ratios, log transforms).
3. **Clusters** customers with K-Means++ (k=3), comparing DBSCAN and hierarchical clustering.
4. **Names personas** and assigns **recommended bank actions** per segment.
5. **Deploys** a saved model so analysts can look up any customer and see their segment in real time.

### The three personas

| Cluster | Persona | ~Share | Bank focus |
|:--:|---|--:|---|
| 0 | **Dormant / Inactive** | 31% | Re-engagement, dormancy alerts — not limit increases |
| 1 | **Active Transactors** | 28% | Limit increases, loyalty offers, micro-loans |
| 2 | **Revolvers (High-Risk)** | 41% | Limit holds, higher APR tiers, cash-advance monitoring |

### Business questions the pipeline answers

1. **Credit-limit policy** — Which clusters warrant limit increases vs. risk holds?
2. **Micro-loan eligibility** — Who combines payment discipline with purchase velocity?
3. **Dormant risk** — How do low-activity accounts differ (dormant vs. healthy vs. pre-churn)?
4. **Cash-advance exposure** — Who needs risk flags or higher APR tiers?
5. **Engagement–risk gap** — High balance frequency but low purchases?
6. **Stress profiles** — When does payment behavior trigger enhanced review?

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  credit_card_customer_clustering.ipynb  (training & EDA)        │
│       ↓ saves                                                   │
│  artifacts/  (model, scaler, PCA, metadata, cleaned CSV)        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        ▼                                       ▼
┌───────────────┐                    ┌──────────────────────┐
│  FastAPI      │◄── /api/v1 proxy ──│  Next.js dashboard   │
│  :8001        │                    │  :3001 dev / :5465   │
│  joblib +     │                    │  React + Tailwind    │
│  sklearn      │                    │  Recharts            │
└───────────────┘                    └──────────────────────┘
        ▲                                       ▲
        └──────────── Browser ──────────────────┘
              (production: same-origin /api/v1/*)
```

| Layer | Technology |
|-------|------------|
| **Notebook** | Jupyter, pandas, scikit-learn, Plotly, seaborn |
| **API** | FastAPI, Uvicorn, Pydantic, joblib |
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS v4, Recharts |
| **Deploy** | Docker Compose, standalone Next build |

---

## Repository layout

| Path | Purpose |
|------|---------|
| `credit_card_customer_clustering.ipynb` | Full ML pipeline — cleaning, EDA, features, clustering, evaluation, artifact export |
| `NOTEBOOK_WALKTHROUGH.md` | Cell-by-cell guide to the notebook (code, charts, plain-language explanations) |
| `api/` | FastAPI inference service (`/api/v1/segment`, `/personas`, `/cluster-map`, `/model-details`) |
| `dashboard/` | Next.js Segment Console UI |
| `artifacts/` | Deployed model files (committed so Docker/API work out of the box) |
| `artifacts/models/` | `best_clustering_model.joblib` (K-Means++, k=3) |
| `artifacts/transformers/` | `scaler.joblib`, `pca.joblib`, `selected_features.json` |
| `artifacts/data/` | `cleaned_dataset.csv` (8,950 rows with cluster labels) |
| `artifacts/metadata.json` | Hyperparameters, metrics, persona map, k-voting summary |
| `docker-compose.yml` | Local Docker (dashboard :3001, API :8001) |
| `docker-compose.prod.yml` | VPS production (dashboard :5465, API internal only) |
| `deploy.env.example` | Production env template for `credit.zokm.me` |
| `PRODUCT.md` / `DESIGN.md` | Product intent and UI design principles |

**Not in the repo (local only):** raw `Dataset/CC GENERAL.csv`, `visuals/` plot exports, coursework reference folders — see `.gitignore`.

---

## Notebook pipeline (summary)

The notebook `credit_card_customer_clustering.ipynb` runs these sections:

| Section | What happens |
|---------|----------------|
| **1. Setup** | Imports, paths, random seed |
| **2. Cleaning** | Load CSV, simulate behavior/account merge, KNN impute, `df_clean` |
| **3. EDA** | Purchases, cash advance, balance, payments, heatmap, pairplot, zero-inflation |
| **4. Features** | `UTILIZATION_RATE`, `AVG_PURCHASE_VALUE`, `PAYMENT_TO_MIN_RATIO`, log1p, scale, select |
| **5. Modeling** | K-Means (k voting 3–7), DBSCAN, Agglomerative + dendrogram |
| **6. Evaluation** | Silhouette, Davies–Bouldin, Calinski–Harabasz; deploy K-Means |
| **7. Personas** | Profile clusters, assign names and actions |
| **8. Artifacts** | Save to `artifacts/` for API inference |

**Re-run notebook:** place `CC GENERAL.csv` in `Dataset/`, run all cells, then redeploy API if artifacts change.

**Detailed guide:** see [`NOTEBOOK_WALKTHROUGH.md`](NOTEBOOK_WALKTHROUGH.md).

---

## Dashboard pages

| Route | Description |
|-------|-------------|
| `/` | Home — navigation and overview |
| `/lookup` | Enter customer features → predict segment (Visa card UI + result panel) |
| `/map` | PCA scatter of 8,950 customers; filter by persona; highlight lookup pin |
| `/personas` | Segment table + deep-dive narratives and recommended actions |
| `/model` | Business questions, feature definitions, algorithm comparison, dendrogram, metrics |

---

## API endpoints

Base path: `/api/v1` (proxied through Next.js in production).

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Service health check |
| `POST` | `/segment` | Predict cluster from 16 raw features |
| `GET` | `/personas` | Persona aggregates (counts, means) |
| `GET` | `/cluster-map` | PCA points for map (optional `?simplified=true`) |
| `GET` | `/model-details` | Full model metadata for `/model` page |
| `GET` | `/sample-customer` | Load example customer for lookup form |

Interactive docs (dev): [http://localhost:8001/docs](http://localhost:8001/docs)

---

## Quick start (local development)

### Prerequisites

- Python 3.11+ (3.13 works)
- Node.js 20+
- Optional: VS Code with recommended tasks in `.vscode/`

### Option A — VS Code tasks

1. **Setup: Full project** (`Ctrl+Shift+P` → Tasks: Run Task)
2. **Dev: Full stack** (`Ctrl+Shift+B`)

Open **http://localhost:3001** (dashboard) · **http://localhost:8001/docs** (API)

### Option B — npm scripts (root)

```bash
npm install
npm run setup          # pip install api deps + dashboard npm install
npm run dev            # API :8001 + dashboard :3001
```

### Option C — manual terminals

```bash
# API
cd api && cp .env.example .env
pip install -r requirements.txt
python serve.py

# Dashboard (second terminal)
cd dashboard && cp .env.example .env.local
npm install && npm run dev
```

### Environment variables

**API** (`api/.env`):

| Variable | Dev | Production (Docker) |
|----------|-----|---------------------|
| `API_HOST` | `127.0.0.1` | `0.0.0.0` |
| `API_PORT` | `8001` | `8001` |
| `API_RELOAD` | `true` | `false` |
| `ARTIFACTS_DIR` | `../artifacts` | `/app/artifacts` |
| `CORS_ORIGINS` | `http://localhost:3001` | your public URL |

**Dashboard** (`dashboard/.env.local`):

| Variable | Dev | Production |
|----------|-----|------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8001` | leave **empty** (use `/api/v1` proxy) |
| `API_PROXY_URL` | `http://127.0.0.1:8001` | `http://api:8001` (Docker build arg) |

---

## Production deployment (VPS)

Pushing to GitHub does **not** update the live site automatically. On the server:

```bash
cd Credit-Card-Customer-Clustering
git pull origin master
docker compose -f docker-compose.prod.yml --env-file deploy.env up -d --build
```

First-time setup:

```bash
git clone https://github.com/zzokm/Credit-Card-Customer-Clustering.git
cd Credit-Card-Customer-Clustering
cp deploy.env.example deploy.env    # edit DOMAIN / WEB_PORT if needed
docker compose -f docker-compose.prod.yml --env-file deploy.env up -d --build
```

| Service | Public | Internal |
|---------|--------|----------|
| Dashboard | `credit.zokm.me:5465` | `web:3001` |
| API | `/api/v1/*` via Next proxy | `api:8001` (not exposed) |

Hard-refresh the browser (`Ctrl+Shift+R`) after deploy.

### Local Docker (mirrors prod pattern)

```bash
docker compose up -d --build
# → http://localhost:3001
```

---

## Inference flow (lookup → segment)

1. Analyst enters 16 fields (balance, purchases, limits, frequencies, etc.).
2. API runs `engineer_features()` → `log1p` on skewed columns → `StandardScaler` → **K-Means `.predict()`**.
3. Response: `cluster_id`, persona name, recommended action, derived metrics, PCA coordinates for the map.

Same logic as the notebook’s `predict_segment()` and saved artifacts.

---

## Model validation (deployed K-Means, k=3)

| Metric | K-Means | DBSCAN | Agglomerative |
|--------|---------|--------|---------------|
| Silhouette ↑ | **0.2009** | 0.1795 | 0.1603 |
| Davies–Bouldin ↓ | 1.6939 | **0.8638** | 1.8045 |
| Calinski–Harabasz ↑ | **2064.19** | 3.73 | 1439.90 |
| Clusters | 3 | 2 | 3 |
| Noise % | 0 | 4.07 | 0 |

**K-Means++** is deployed because it supports real-time `.predict()` for new customers, not because it wins every metric.

---

## Scripts & quality gates

```bash
npm run lint          # ESLint (dashboard)
npm run typecheck     # TypeScript
npm run build         # Production Next.js build
```

VS Code tasks: see table in repo (Setup, Dev, Build, Docker, Health check).

---

## Dataset

Training uses the **Credit Card Dataset for Clustering** (CC GENERAL) from Kaggle. Download and place at:

```
Dataset/CC GENERAL.csv
```

The repo includes **cleaned data and model artifacts** so the API and dashboard work without re-running the notebook.

---

## Documentation

| Doc | Contents |
|-----|----------|
| [`NOTEBOOK_WALKTHROUGH.md`](NOTEBOOK_WALKTHROUGH.md) | Full notebook explained cell-by-cell |
| [`PRODUCT.md`](PRODUCT.md) | Users, personas, product principles |
| [`DESIGN.md`](DESIGN.md) | UI/UX design system |
| [`api/README.md`](api/README.md) | API-specific notes |

---

## License & attribution

Academic / portfolio project. Dataset: CC GENERAL (Kaggle). Built with scikit-learn, FastAPI, and Next.js.
