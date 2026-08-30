#!/bin/bash
# Diagnostic rapide API DjamSanté sur le VPS
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== Node ==="
node -v
npm -v

echo ""
echo "=== Fichiers ==="
ls -la index.js ecosystem.config.js .env 2>/dev/null || echo ".env manquant !"

echo ""
echo "=== .env (masqué) ==="
grep -E '^(NODE_ENV|PORT|DB_HOST|DB_NAME|DB_USER|JWT_SECRET|SEED_DEMO)=' .env 2>/dev/null | sed 's/JWT_SECRET=.*/JWT_SECRET=***MASKED***/; s/DB_PASSWORD=.*/DB_PASSWORD=***MASKED***/' || true

echo ""
echo "=== MySQL ==="
node -e "
require('dotenv').config();
const { Sequelize } = require('sequelize');
const s = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST, port: process.env.DB_PORT, dialect: 'mysql', logging: false,
});
s.authenticate().then(() => { console.log('MySQL OK'); process.exit(0); })
  .catch((e) => { console.error('MySQL ERREUR:', e.message); process.exit(1); });
"

echo ""
echo "=== Démarrage direct (10s) ==="
timeout 10 node index.js 2>&1 || true

echo ""
echo "=== Dernières lignes PM2 ==="
pm2 logs djamsante-api --lines 25 --nostream 2>/dev/null || true
