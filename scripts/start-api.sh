#!/bin/bash
# Démarre l'API avec le bon répertoire de travail (pour PM2)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
mkdir -p logs uploads data
export NODE_ENV="${NODE_ENV:-production}"
exec node index.js
