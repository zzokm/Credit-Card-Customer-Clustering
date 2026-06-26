# Segment Console

Credit card customer segmentation: Jupyter pipeline + FastAPI inference + Next.js analyst dashboard.

## Quick start (VS Code)

1. Run task **Setup: Full project** (`Ctrl+Shift+P` → Tasks: Run Task)
2. Run task **Dev: Full stack** (default build task: `Ctrl+Shift+B`)

Open http://localhost:3001 (dashboard) · API http://localhost:8001/docs

## Project layout

| Path | Role |
|------|------|
| `api/` | FastAPI + joblib inference |
| `dashboard/` | Next.js 16 + Tailwind v4 UI |
| `artifacts/` | Model, scaler, PCA, cleaned data |
| `.vscode/` | Tasks, launch configs, settings |

## Development

### npm (root)

```bash
npm install          # concurrently + cross-env
npm run setup        # pip + dashboard deps
npm run dev          # API :8001 + dashboard :3001
```

### Manual

```bash
# API
cd api && cp .env.example .env
python serve.py      # reads api/.env via python-dotenv

# Dashboard
cd dashboard && cp .env.example .env.local
npm run dev
```

### Environment variables

**API** (`api/.env` — copy from `api/.env.example`):

| Variable | Dev | Prod |
|----------|-----|------|
| `API_HOST` | `127.0.0.1` | `0.0.0.0` |
| `API_PORT` | `8001` | `8001` |
| `API_RELOAD` | `true` | `false` |
| `API_WORKERS` | `1` | `2` |
| `CORS_ORIGINS` | `http://localhost:3001,...` | your dashboard URL |
| `ARTIFACTS_DIR` | `../artifacts` | `/app/artifacts` |

**Dashboard** (`dashboard/.env.local` / `.env.production`):

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | FastAPI base URL (no trailing slash) |

## Production

### VPS (credit.zokm.me)

Production Docker routes the browser through Next.js on port **5465**; `/api/v1/*` is proxied internally to FastAPI on **8001** (not published to the host).

```bash
cp deploy.env.example deploy.env   # edit if domain/ports change
docker compose -f docker-compose.prod.yml --env-file deploy.env up -d --build
```

Open `http://credit.zokm.me:5465` (or terminate TLS at your reverse proxy on 443 → 5465).

| Service | Host | Internal |
|---------|------|----------|
| Dashboard | `:5465` | `web:3001` |
| API | `/api/v1/*` via Next proxy | `api:8001` |

Included in the API image: `artifacts/models/`, `artifacts/transformers/`, `artifacts/data/cleaned_dataset.csv`, `metadata.json`.

### Local production (no Docker)

```bash
npm run build        # next build (standalone output)
npm run start        # API workers + next start
```

Or VS Code tasks: **Build: Production (full)** then **Prod: Full stack**.

### Docker

```bash
# Local stack (dashboard :3001, API :8001, same /api proxy pattern)
docker compose up -d --build

# VPS production (dashboard :5465, API internal only)
cp deploy.env.example deploy.env
docker compose -f docker-compose.prod.yml --env-file deploy.env up -d --build
```

For VPS, leave `NEXT_PUBLIC_API_URL` empty in `deploy.env` so the browser uses same-origin `/api/v1/*`.

## VS Code tasks reference

| Task | Purpose |
|------|---------|
| **Setup: Full project** | venv, deps, env files |
| **Dev: Full stack** | API reload + Next dev (default) |
| **Build: Production (full)** | `next build` |
| **Prod: Full stack** | API workers + `next start` |
| **Docker: Up (prod)** | Containerized prod stack |
| **Debug: Full stack** | Launch.json compound |
| **Test: API health** | Hit `/api/v1/health` |
| **Lint / Typecheck** | Dashboard quality gates |

Strategic docs: `PRODUCT.md`, `DESIGN.md`.
