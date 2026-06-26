# Starts FastAPI in dev mode. Safe for paths with spaces/apostrophes (e.g. Youssef's).
$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$ApiDir = Join-Path $Root "api"
$VenvPython = Join-Path $Root ".venv\Scripts\python.exe"
$Requirements = Join-Path $Root "api\requirements.txt"

if (-not (Test-Path $VenvPython)) {
    Write-Host "[dev-api] Creating .venv ..."
    python -m venv (Join-Path $Root ".venv")
    if (-not (Test-Path $VenvPython)) {
        throw "Failed to create virtual environment at $VenvPython"
    }
    Write-Host "[dev-api] Installing API dependencies ..."
    & $VenvPython -m pip install --upgrade pip
    & $VenvPython -m pip install -r $Requirements
}

$env:API_HOST = if ($env:API_HOST) { $env:API_HOST } else { "127.0.0.1" }
$env:API_PORT = if ($env:API_PORT) { $env:API_PORT } else { "8001" }
$env:API_RELOAD = if ($env:API_RELOAD) { $env:API_RELOAD } else { "true" }
$env:API_WORKERS = if ($env:API_WORKERS) { $env:API_WORKERS } else { "1" }
$env:API_LOG_LEVEL = if ($env:API_LOG_LEVEL) { $env:API_LOG_LEVEL } else { "info" }
if (-not $env:CORS_ORIGINS) {
    $env:CORS_ORIGINS = "http://localhost:3001,http://127.0.0.1:3001"
}
$env:ARTIFACTS_DIR = if ($env:ARTIFACTS_DIR) { $env:ARTIFACTS_DIR } else { (Join-Path $Root "artifacts") }

Set-Location $ApiDir
Write-Host "[dev-api] Starting API at http://$($env:API_HOST):$($env:API_PORT) (reload=$($env:API_RELOAD))"
& $VenvPython serve.py
