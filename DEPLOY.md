# Déploiement DjamSanté en production

> **Guide IONOS pas à pas** : voir [deploy/IONOS.md](deploy/IONOS.md)

Guide pour héberger l'API Node.js + le frontend React sur un VPS (IONOS, OVH, Contabo…).

## Architecture recommandée

```
djamsante.cm          → Frontend React (fichiers statiques)
api.djamsante.cm      → Backend Express (port 3000, derrière Nginx)
MySQL                 → Base de données sur le même VPS ou service managé
```

| Composant | Outil | Notes |
|-----------|-------|-------|
| Domaine + DNS | IONOS | Sous-domaines `api.` et `app.` (ou racine) |
| Serveur API | VPS Linux + Node 20 + PM2 | **Pas FileZilla pour l'API** |
| Frontend | `npm run build` → upload `dist/` | FileZilla OK pour les fichiers statiques |
| SSL | Certbot (Let's Encrypt) | Gratuit, via Nginx |
| SMS prod | Africa's Talking | `SMS_MODE=live` |
| Paiements | CinetPay | Clés API Orange/MTN |

---

## 1. Préparer le serveur (Ubuntu 22.04)

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx mysql-server certbot python3-certbot-nginx git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

## 2. Base de données MySQL

```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE e_sante CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'medisante'@'localhost' IDENTIFIED BY 'MOT_DE_PASSE_FORT';
GRANT ALL PRIVILEGES ON e_sante.* TO 'medisante'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 3. Déployer le backend

> **Important** : poussez d'abord votre code sur GitHub (`git push origin backend`) avant de cloner sur le serveur.

**Installation automatique (recommandé)** :

```bash
export DOMAIN=votre-domaine.cm
export DB_PASSWORD='mot_de_passe_fort'
export GIT_BRANCH=backend
git clone -b backend https://github.com/itskanoute/DjamSante.git /var/www/medisante
cd /var/www/medisante
sudo bash scripts/server-install.sh
```

**Installation manuelle** :

```bash
cd /var/www
sudo git clone -b backend https://github.com/itskanoute/DjamSante.git medisante
cd medisante
sudo cp .env.production.example .env
# Éditer .env avec vos vraies valeurs
npm install --omit=dev
mkdir -p uploads data logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 4. Build et déployer le frontend

**En local (Windows)** :

```powershell
cd DjamSante
.\scripts\build-production.ps1 -ApiUrl "https://api.votre-domaine.cm/api"
```

Uploader le contenu de `Front/dist/` vers `/var/www/medisante-front/` (FileZilla, SCP…).

## 5. Nginx

Copier `deploy/nginx-medisante.conf.example` vers `/etc/nginx/sites-available/medisante`, adapter les domaines, puis :

```bash
sudo ln -s /etc/nginx/sites-available/medisante /etc/nginx/sites-enabled/
sudo nginx -t
sudo certbot --nginx -d djamsante.cm -d api.djamsante.cm
sudo systemctl reload nginx
```

## 6. Variables d'environnement critiques

Voir `.env.production.example`. Minimum :

- `NODE_ENV=production`
- `JWT_SECRET` — 48+ caractères aléatoires
- `DB_*` — identifiants MySQL
- `CORS_ORIGINS` — URL du frontend
- `API_PUBLIC_URL` — URL publique de l'API
- `FRONTEND_URL` — URL du frontend
- `GEMINI_API_KEY` — assistant IA
- `SMS_MODE=live` + clés Africa's Talking
- `CINETPAY_*` — paiements réels
- `SEED_DEMO=false` — **obligatoire en prod**

## 7. Rappels SMS RDV

Le cron interne s'exécute chaque jour à `RDV_REMINDER_HOUR` (défaut 8h).

Test manuel :

```bash
node scripts/test-rdv-reminder.js
```

En dev (`SMS_MODE=mock`), les SMS s'affichent dans les logs `[SMS MOCK]`.

## 8. Checklist avant mise en ligne

- [ ] `SEED_DEMO=false`
- [ ] `DB_SYNC_ALTER=false`
- [ ] JWT_SECRET fort et unique
- [ ] CORS limité au domaine frontend
- [ ] SSL actif (HTTPS)
- [ ] Sauvegardes MySQL planifiées (`mysqldump` cron)
- [ ] `.env` jamais commité dans git
- [ ] Swagger désactivé (`ENABLE_SWAGGER=false`)

## 9. Mise à jour

```bash
cd /var/www/medisante
git pull origin backend
npm install --production
pm2 restart medisante-api
# Rebuild frontend en local et re-uploader dist/
```

---

**Support** : en cas de problème, vérifier `pm2 logs medisante-api` et `/var/log/nginx/error.log`.
