<#
PowerShell helper to run the PHP built-in server using Docker.
Usage: Open PowerShell in repo root and run:
  .\backend\serve-php.ps1

This avoids installing PHP locally; it starts a short-lived container that serves the `backend/` folder on port 8000.
#>

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Error "Docker is not installed or not in PATH. Install Docker Desktop and try again."
  exit 1
}

# Run docker with current working dir mounted into /app
$pwdPath = (Get-Location).Path
Write-Host "Starting PHP server (Docker) serving $pwdPath\backend on http://localhost:8000"

docker run --rm -p 8000:8000 -v "${pwdPath}/backend:/app" -w /app php:8.1-cli php -S 0.0.0.0:8000 -t /app
