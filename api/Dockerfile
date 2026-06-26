# syntax=docker/dockerfile:1

FROM python:3.12-slim AS api

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    API_HOST=0.0.0.0 \
    API_PORT=8001 \
    API_RELOAD=false \
    API_WORKERS=2 \
    ARTIFACTS_DIR=/app/artifacts

RUN apt-get update \
    && apt-get install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY api/requirements.txt /app/api/requirements.txt
RUN pip install --no-cache-dir -r /app/api/requirements.txt

COPY api/ /app/api/
COPY artifacts/metadata.json /app/artifacts/metadata.json
COPY artifacts/data/cleaned_dataset.csv /app/artifacts/data/cleaned_dataset.csv
COPY artifacts/models/ /app/artifacts/models/
COPY artifacts/transformers/ /app/artifacts/transformers/

WORKDIR /app/api

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8001/api/v1/health')"

CMD ["python", "serve.py"]
