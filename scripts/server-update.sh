#!/bin/bash
# Mise à jour MediSanté sur le serveur
# Usage : cd /var/www/medisante && sudo bash scripts/server-update.sh

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/djamsante}"
BRANCH="${GIT_BRANCH:-backend}"

cd "$APP_DIR"
echo "=== Mise à jour MediSanté ==="
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"
npm install --omit=dev
pm2 restart djamsante-api
echo "Backend redémarré."
echo "N'oubliez pas de re-uploader Front/dist/ si le frontend a changé."
