"""Runtime configuration via environment variables."""

from __future__ import annotations

import os
from pathlib import Path

try:
    from dotenv import load_dotenv

    load_dotenv(Path(__file__).resolve().parent / ".env")
except ImportError:
    pass


def _env_bool(key: str, default: bool = False) -> bool:
    return os.getenv(key, str(default)).lower() in ("1", "true", "yes", "on")


def _env_list(key: str, default: str) -> list[str]:
    raw = os.getenv(key, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


class Settings:
    host: str = os.getenv("API_HOST", "127.0.0.1")
    port: int = int(os.getenv("API_PORT", "8001"))
    reload: bool = _env_bool("API_RELOAD", False)
    workers: int = max(1, int(os.getenv("API_WORKERS", "1")))
    log_level: str = os.getenv("API_LOG_LEVEL", "info")
    cors_origins: list[str] = _env_list(
        "CORS_ORIGINS",
        "http://localhost:3001,http://127.0.0.1:3001",
    )
    cors_origin_regex: str | None = os.getenv(
        "CORS_ORIGIN_REGEX",
        r"http://(localhost|127\.0\.0\.1):\d+",
    )
    artifacts_dir: Path = Path(
        os.getenv("ARTIFACTS_DIR", str(Path(__file__).resolve().parent.parent / "artifacts"))
    )


settings = Settings()
