# Test local — DjamSanté (Phase 2)

Guide pour lancer l'API et le frontend en local, tester le réseau professionnel, puis publier sur le VPS.

## Prérequis

- **XAMPP** — MySQL démarré (port 3306)
- **Node.js** 18+ et npm
- Base `e_sante` créée dans phpMyAdmin (vide : les migrations se font au démarrage de l'API)

## 1. Démarrer le backend

```powershell
cd "c:\Users\Chérubin Info\Pictures\entretien\E-Sante"
npm install
npm run dev
```

Au premier lancement, l'API crée les tables et insère les comptes démo. Vérifier : `http://localhost:3000/api/health` (ou logs « Server running »).

## 2. Démarrer le frontend

Dans un **second terminal** :

```powershell
cd "c:\Users\Chérubin Info\Pictures\entretien\E-Sante\Front"
npm install
npm run dev
```

Ouvrir : **http://localhost:5173**

Le fichier `Front/.env` doit contenir :

```
VITE_API_URL=http://localhost:3000/api
```

## 3. Comptes de test

| Branche | E-mail | Mot de passe |
|---------|--------|--------------|
| Patient | `patient@e-sante.sn` | `Patient123!` |
| Médecin | `dr.fatou@e-sante.sn` | `Medecin123!` |
| Aide-soignant(e) | `aide@e-sante.sn` | `Medecin123!` |
| Pharmacie | `pharma@e-sante.sn` | `Pharmacie123!` |
| Hôpital | `hopital@e-sante.sn` | `Pharmacie123!` |
| Clinique | `clinique@e-sante.sn` | `Pharmacie123!` |
| Admin MINSANTE | `admin@e-sante.sn` | `Admin123!` |

En mode développement, la page de connexion affiche ces comptes en un clic.

OTP SMS (mode mock) : **`123456`** — défini dans `.env` (`SMS_MODE=mock`).

## 4. Scénarios Phase 2 à valider

### A. Horaires par lieu (médecin)

1. Connexion **médecin** → menu **Carrière** (`/medecin/carriere`)
2. Section **Affiliations** → éditer les horaires d'un lieu (hôpital, clinique ou cabinet)
3. Enregistrer → recharger la page : les horaires doivent persister

### B. Invitation médecin (structure)

1. Connexion **hôpital** ou **clinique** (compte structure démo si disponible, ou admin)
2. **Médecins affiliés** → inviter par email un médecin existant
3. Vérifier les logs API : `[EMAIL MOCK] Affiliation invite → ...` (SMTP vide en local)
4. Côté médecin : accepter l'invitation dans **Carrière**

### C. Équipe visible sur fiche établissement

1. Structure → **Équipe** → ajouter un membre (pharmacien, infirmier, etc.)
2. Déconnexion ou compte **patient** → **Santé** → ouvrir la fiche de l'établissement
3. Section **Notre équipe** doit lister les membres

### D. Recherche médecins par établissement

1. Compte **patient** → **Santé** → onglet **Médecins**
2. Filtre **Établissement** : choisir un hôpital/clinique
3. Seuls les médecins affiliés (ou rattachés) à cette structure apparaissent

### E. RDV avec lieu de consultation

1. Patient → fiche d'un médecin avec plusieurs affiliations
2. **Prendre rendez-vous** → sélectionner **Lieu de consultation**
3. Choisir une date → les créneaux doivent correspondre aux horaires du lieu choisi

## 5. Build de production (local)

```powershell
cd "c:\Users\Chérubin Info\Pictures\entretien\E-Sante\Front"
npm run build
```

Le dossier `Front/dist/` est prêt à être copié sur le serveur web.

## 6. Publication sur le VPS

Serveur : **31.70.132.160**  
Chemins : API `/var/www/djamsante` — Frontend statique `/var/www/djamsante-front`  
Process PM2 : `djamsante-api`

### Option rapide (sur le VPS)

```bash
cd /var/www/djamsante
sudo bash scripts/vps-update.sh
```

### Option manuelle

```bash
cd /var/www/djamsante
git pull origin backend
npm install --omit=dev
npm run ensure-admin
pm2 delete djamsante-api 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

cd Front
npm install
npm run build
cp -r dist/* /var/www/djamsante-front/
```

### Vérifications post-déploiement

```bash
pm2 status djamsante-api
pm2 logs djamsante-api --lines 30 --nostream
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/api/auth/login \
  -X POST -H 'Content-Type: application/json' -d '{}'
```

- Code **400** ou **401** = API répond (normal sans identifiants valides)
- Code **502** = Nginx ne joint pas l'API → vérifier PM2

### Frontend en production

Sur le VPS, `Front/.env.production` (ou variable au build) doit pointer vers l'URL publique de l'API, par ex. :

```
VITE_API_URL=https://votre-domaine.cm/api
```

Puis rebuild + copie vers `/var/www/djamsante-front/`.

## 7. Dépannage local

| Problème | Solution |
|----------|----------|
| `ECONNREFUSED` MySQL | Démarrer MySQL dans XAMPP |
| Login « Email ou mot de passe incorrect » | `npm run ensure-admin` puis réessayer |
| CORS | Vérifier `FRONTEND_URL=http://localhost:5173` dans `.env` |
| Pas d'email d'invitation | Normal sans SMTP ; consulter la console API |
| Tables manquantes | Redémarrer l'API ; si besoin `DB_SYNC_ALTER=true` une fois puis remettre `false` |

## 8. Pousser les changements (Git)

Depuis la machine de dev :

```powershell
cd "c:\Users\Chérubin Info\Pictures\entretien\E-Sante"
git add -A
git status
git commit -m "Phase 2: horaires par lieu, équipe publique, filtres établissement"
git push origin backend
```

Puis sur le VPS : `git pull` + script ci-dessus.
