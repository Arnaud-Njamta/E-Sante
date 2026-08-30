#!/bin/bash
# Installation DjamSanté sur VPS Ubuntu (IONOS, OVH, Contabo…)
# Usage sur le serveur :
#   export DOMAIN=djamsante.cm
#   export DB_PASSWORD='mot_de_passe_fort'
#   export GIT_BRANCH=backend
#   bash scripts/server-install.sh

set -euo pipefail

DOMAIN="${DOMAIN:-djamsante.cm}"
API_DOMAIN="${API_DOMAIN:-api.$DOMAIN}"
DB_NAME="${DB_NAME:-e_sante}"
DB_USER="${DB_USER:-djamsante}"
DB_PASSWORD="${DB_PASSWORD:?Définissez DB_PASSWORD avant de lancer ce script}"
GIT_REPO="${GIT_REPO:-https://github.com/itskanoute/E-Sante.git}"
GIT_BRANCH="${GIT_BRANCH:-backend}"
APP_DIR="/var/www/djamsante"
FRONT_DIR="/var/www/djamsante-front"

echo "=== DjamSanté — installation serveur ==="
echo "Domaine : $DOMAIN / API : $API_DOMAIN"

if [ "$(id -u)" -ne 0 ]; then
  echo "Relancez avec sudo : sudo bash scripts/server-install.sh"
  exit 1
fi

echo "[1/8] Paquets système..."
apt-get update -qq
apt-get install -y nginx mysql-server git curl certbot python3-certbot-nginx

if ! command -v node &>/dev/null || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]]; then
  echo "[2/8] Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
else
  echo "[2/8] Node.js déjà installé : $(node -v)"
fi

if ! command -v pm2 &>/dev/null; then
  npm install -g pm2
fi

echo "[3/8] Base MySQL..."
mysql -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';"
mysql -e "GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

echo "[4/8] Code source..."
mkdir -p /var/www
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR" && git fetch && git checkout "$GIT_BRANCH" && git pull origin "$GIT_BRANCH"
else
  git clone -b "$GIT_BRANCH" "$GIT_REPO" "$APP_DIR"
  cd "$APP_DIR"
fi

echo "[5/8] Configuration .env..."
JWT_SECRET=$(openssl rand -base64 48 | tr -d '\n')
if [ ! -f .env ]; then
  cp .env.production.example .env
fi

# Mise à jour des variables critiques
sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=$DB_PASSWORD|" .env
sed -i "s|^DB_USER=.*|DB_USER=$DB_USER|" .env
sed -i "s|^DB_NAME=.*|DB_NAME=$DB_NAME|" .env
sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env
sed -i "s|^FRONTEND_URL=.*|FRONTEND_URL=https://$DOMAIN|" .env
sed -i "s|^CORS_ORIGINS=.*|CORS_ORIGINS=https://$DOMAIN|" .env
sed -i "s|^API_PUBLIC_URL=.*|API_PUBLIC_URL=https://$API_DOMAIN|" .env
sed -i "s|^NODE_ENV=.*|NODE_ENV=production|" .env
sed -i "s|^SEED_DEMO=.*|SEED_DEMO=false|" .env

echo "IMPORTANT : éditez $APP_DIR/.env pour GEMINI_API_KEY, CINETPAY, SMS…"
echo "JWT_SECRET généré automatiquement."

mkdir -p uploads data logs
npm install --omit=dev

echo "[6/8] PM2..."
pm2 delete djamsante-api 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || pm2 startup

echo "[7/8] Nginx..."
mkdir -p "$FRONT_DIR"
chown -R www-data:www-data "$FRONT_DIR"

cat > /etc/nginx/sites-available/djamsante <<NGINX
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    root $FRONT_DIR;
    index index.html;
    location / { try_files \$uri \$uri/ /index.html; }
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)\$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

server {
    listen 80;
    server_name $API_DOMAIN;
    client_max_body_size 12M;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/djamsante /etc/nginx/sites-enabled/djamsante
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo "[8/8] SSL (si DNS déjà pointé vers ce serveur)..."
if certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" -d "$API_DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN" 2>/dev/null; then
  echo "SSL activé."
else
  echo "SSL reporté — configurez le DNS puis lancez :"
  echo "  certbot --nginx -d $DOMAIN -d www.$DOMAIN -d $API_DOMAIN"
fi

echo ""
echo "=== Backend installé ==="
echo "API : http://$API_DOMAIN/api/health"
echo "Frontend : uploadez Front/dist/ vers $FRONT_DIR"
echo "Test API : curl http://localhost:3000/api/health"
echo "Logs : pm2 logs djamsante-api"
