# Déploiement IONOS — DjamSanté (guide pas à pas)

## Ce dont vous avez besoin

| Élément | IONOS | Prix indicatif |
|---------|-------|----------------|
| Nom de domaine | `djamsante.cm` ou `.com` | ~10–15 €/an |
| VPS Linux | VPS S ou M (Ubuntu 22.04) | ~5–10 €/mois |
| (Optionnel) Email SMTP | IONOS Mail | inclus parfois |

> **FileZilla** sert à envoyer le **frontend** (`Front/dist/`).  
> Le **backend Node.js** tourne sur le VPS via SSH — pas via FTP.

---

## Étape 1 — Acheter et configurer

1. **Domaine** : achetez `votre-domaine.cm` chez IONOS
2. **VPS** : commandez un VPS Linux Ubuntu 22.04
3. Notez l’**IP publique** du VPS (ex. `203.0.113.50`)

## Étape 2 — DNS (panneau IONOS)

Dans **Domaines → DNS** :

| Type | Nom | Valeur |
|------|-----|--------|
| A | `@` | IP du VPS |
| A | `www` | IP du VPS |
| A | `api` | IP du VPS |

Attendez 5–30 min la propagation DNS.

## Étape 3 — Backend sur le VPS (SSH)

Connectez-vous en SSH (PuTTY ou terminal) :

```bash
ssh root@VOTRE_IP_VPS
```

Puis :

```bash
export DOMAIN=votre-domaine.cm
export DB_PASSWORD='ChoisissezUnMotDePasseFort123!'
export GIT_BRANCH=backend

# Cloner le repo (si pas encore fait)
git clone -b backend https://github.com/itskanoute/DjamSante.git /var/www/medisante
cd /var/www/medisante

# Installation automatique
sudo bash scripts/server-install.sh
```

Éditez ensuite le `.env` sur le serveur :

```bash
nano /var/www/medisante/.env
```

Renseignez au minimum :
- `GEMINI_API_KEY` — votre clé Google AI
- `SMS_MODE=mock` (ou `live` + clés Africa's Talking plus tard)
- `CINETPAY_*` quand vous aurez les clés

Redémarrez :

```bash
pm2 restart medisante-api
```

Vérifiez :

```bash
curl https://api.votre-domaine.cm/api/health
# → {"success":true,"status":"ok","env":"production"}
```

## Étape 4 — Frontend (depuis votre PC Windows)

**Sur votre machine locale** :

```powershell
cd DjamSante
.\scripts\build-production.ps1 -ApiUrl "https://api.votre-domaine.cm/api"
```

Cela crée `Front/dist/`.

## Étape 5 — Upload FileZilla

1. Ouvrez **FileZilla**
2. Hôte : `sftp://VOTRE_IP_VPS` — utilisateur `root` (ou un user SFTP)
3. Dossier distant : `/var/www/medisante-front/`
4. Uploadez **tout le contenu** de `Front/dist/` (pas le dossier `dist` lui-même)

## Étape 6 — SSL (HTTPS)

Si pas fait par le script d’installation :

```bash
sudo certbot --nginx -d votre-domaine.cm -d www.votre-domaine.cm -d api.votre-domaine.cm
```

## Étape 7 — Test final

| URL | Attendu |
|-----|---------|
| `https://votre-domaine.cm` | Page de connexion DjamSanté |
| `https://api.votre-domaine.cm/api/health` | `{"success":true}` |
| Connexion `patient@e-sante.sn` | Fonctionne si `SEED_DEMO=true` (dev seulement) |

En production : `SEED_DEMO=false` — créez de vrais comptes via l’inscription.

---

## Mises à jour ultérieures

**Backend** (sur le VPS) :

```bash
cd /var/www/medisante && sudo bash scripts/server-update.sh
```

**Frontend** (sur votre PC) :

```powershell
.\scripts\build-production.ps1 -ApiUrl "https://api.votre-domaine.cm/api"
# Puis re-uploader Front/dist/ via FileZilla
```

---

## Dépannage

| Problème | Solution |
|----------|----------|
| Site inaccessible | Vérifier DNS + `sudo nginx -t` |
| API 502 | `pm2 logs medisante-api` |
| CORS error | `CORS_ORIGINS` = URL exacte du frontend dans `.env` |
| MySQL refused | `sudo systemctl status mysql` |
| IA ne répond pas | Vérifier `GEMINI_API_KEY` dans `.env` prod |
