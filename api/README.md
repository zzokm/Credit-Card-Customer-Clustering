# Segment Console API

FastAPI service loading joblib artifacts from `../artifacts/` (override with `ARTIFACTS_DIR`).

## Development

```bash
cp .env.example .env
pip install -r requirements.txt
python serve.py
```

Docs: http://localhost:8001/docs

## Production

```bash
cp .env.production.example .env
# Edit CORS_ORIGINS and API_WORKERS
python serve.py
```

Or Docker: `docker compose build api` from repo root.

## Configuration

See `.env.example` and `.env.production.example`. Loaded automatically via `python-dotenv` when `api/.env` exists; VS Code tasks also inject env vars.
