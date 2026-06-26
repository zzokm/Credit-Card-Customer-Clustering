"""Uvicorn entrypoint for dev and production."""

from __future__ import annotations

import uvicorn

from config import settings


def main() -> None:
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.reload,
        workers=settings.workers if not settings.reload else 1,
        log_level=settings.log_level,
    )


if __name__ == "__main__":
    main()
