#!/usr/bin/env bash
# Helper to run PHP built-in server using Docker (for macOS/Linux)
# Usage: ./backend/serve-php.sh

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed or not in PATH. Install Docker and try again." >&2
  exit 1
fi

echo "Starting PHP server (Docker) serving $(pwd)/backend on http://localhost:8000"

docker run --rm -p 8000:8000 -v "$(pwd)/backend:/app" -w /app php:8.1-cli php -S 0.0.0.0:8000 -t /app