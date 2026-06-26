# Production API launcher (no reload, multiple workers).
$ErrorActionPreference = "Stop"

$env:API_HOST = if ($env:API_HOST) { $env:API_HOST } else { "0.0.0.0" }
$env:API_RELOAD = if ($env:API_RELOAD) { $env:API_RELOAD } else { "false" }
$env:API_WORKERS = if ($env:API_WORKERS) { $env:API_WORKERS } else { "2" }
$env:API_LOG_LEVEL = if ($env:API_LOG_LEVEL) { $env:API_LOG_LEVEL } else { "warning" }

& (Join-Path $PSScriptRoot "dev-api.ps1")
