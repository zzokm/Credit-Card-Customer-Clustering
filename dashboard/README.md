# Segment Console

Analyst dashboard for credit card customer segmentation (K-Means++, k=3).

## Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS v4, TypeScript
- **Backend:** FastAPI + joblib artifacts from `../artifacts/`

## Run locally

See the [root README](../README.md) for full dev/prod and VS Code task docs.

**Quick dev** (from repo root):

```bash
npm run setup
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) — defaults to **Segment lookup**.

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/segment` | Predict cluster from raw customer features |
| GET | `/api/v1/cluster-map` | PCA scatter points (`?simplified=true` for ~2k sample) |
| GET | `/api/v1/personas` | Persona aggregate table |
| GET | `/api/v1/metadata` | Model metadata JSON |
| GET | `/api/v1/sample-customer` | Sample input row for the lookup form |

## Project context

Strategic and visual specs live in `../PRODUCT.md` and `../DESIGN.md`.
