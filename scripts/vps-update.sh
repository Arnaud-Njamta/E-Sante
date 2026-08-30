#!/bin/bash
# Mise à jour rapide sur le VPS — à lancer depuis la racine du dépôt backend
# Usage : cd /var/www/djamsante && sudo bash scripts/vps-update.sh

set -euo pipefail

APP_DIR="/var/www/djamsante"
FRONT_BUILD_DIR="$APP_DIR/Front"
FRONT_WEB_DIR="/var/www/djamsante-front"

cd "$APP_DIR"

echo "=== [1/5] Git pull ==="
git pull origin backend

echo "=== [2/5] Backend npm install ==="
npm install --omit=dev

echo "=== [3/5] Compte admin ==="
npm run ensure-admin

echo "=== [4/5] Redémarrage API ==="
pm2 restart djamsante-api
sleep 2
pm2 status djamsante-api

echo "=== [5/5] Build frontend ==="
cd "$FRONT_BUILD_DIR"
npm install
npm run build
cp -r dist/* "$FRONT_WEB_DIR/"

echo ""
echo "=== Terminé ==="
echo "Vérifiez l'API : curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/api/auth/login -X POST -H 'Content-Type: application/json' -d '{}'"
echo "Logs API : pm2 logs djamsante-api --lines 40"
echo "Admin : admin@e-sante.sn / Admin123!"
