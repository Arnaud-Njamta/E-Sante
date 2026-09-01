#!/bin/bash
# Installe la config Nginx DjamSanté sur le VPS (à lancer depuis /var/www/djamsante)
set -e
CONF_SRC="$(dirname "$0")/../deploy/nginx-djamsante-vps.conf"
CONF_DST="/etc/nginx/sites-available/djamsante"

if [ ! -f "$CONF_SRC" ]; then
  echo "Fichier introuvable: $CONF_SRC"
  exit 1
fi

cp "$CONF_SRC" "$CONF_DST"
ln -sf "$CONF_DST" /etc/nginx/sites-enabled/djamsante
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl reload nginx

echo ""
echo "=== Tests ==="
echo -n "API locale:  "
curl -sf http://127.0.0.1:3000/api/health | head -c 80 || echo "FAIL (pm2 start ecosystem.config.js ?)"
echo ""
echo -n "API publique:"
curl -sf http://127.0.0.1/api/health | head -c 80 || curl -sf http://31.70.132.160/api/health | head -c 80 || echo " FAIL"
echo ""
