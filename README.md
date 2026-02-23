# E-SANTE - Backend API

API REST pour l'amélioration de l'observance thérapeutique.

Application de santé permettant aux patients de gérer leurs traitements médicamenteux, scanner leurs ordonnances, recevoir des rappels intelligents et suivre leur observance en temps réel.

---

## Stack Technique

| Technologie | Rôle |
|---|---|
| **Express.js** | Framework API REST |
| **Sequelize** | ORM pour MySQL |
| **MySQL** | Base de données relationnelle |
| **bcrypt** | Hachage des mots de passe (12 rounds) |
| **jsonwebtoken** | Authentification JWT (access + refresh token) |
| **Swagger** | Documentation interactive de l'API |
| **Joi** | Validation des données entrantes |
| **Multer** | Upload de fichiers (ordonnances) |
| **Helmet** | Sécurité HTTP headers |
| **CORS** | Cross-Origin Resource Sharing |
| **Morgan** | Logging des requêtes HTTP |
| **express-rate-limit** | Protection contre le brute force |

---

## Structure du Projet

```
e-sante-backend/
│
├── index.js                          # Point d'entrée de l'application
├── package.json                      # Dépendances et scripts
├── .env                              # Variables d'environnement (non versionné)
├── .env.example                      # Template des variables d'environnement
├── .gitignore                        # Fichiers ignorés par Git
│
├── config/
│   ├── database.js                   # Configuration Sequelize / MySQL
│   └── swagger.js                    # Configuration Swagger OpenAPI 3.0
│
├── models/
│   ├── index.js                      # Initialisation Sequelize + associations
│   ├── Patient.js                    # Modèle patients (profil, paramètres de vie)
│   ├── Traitement.js                 # Modèle traitements médicamenteux
│   ├── PriseProgrammee.js            # Modèle prises programmées (horaires)
│   ├── HistoriquePrise.js            # Modèle historique des prises
│   └── Ordonnance.js                 # Modèle ordonnances scannées
│
├── controllers/
│   ├── auth.controller.js            # Contrôleur authentification
│   ├── patient.controller.js         # Contrôleur profil patient
│   ├── traitement.controller.js      # Contrôleur traitements (CRUD)
│   ├── prise.controller.js           # Contrôleur prises médicamenteuses
│   ├── ordonnance.controller.js      # Contrôleur ordonnances
│   └── statistique.controller.js     # Contrôleur statistiques et observance
│
├── routes/
│   ├── index.js                      # Agrégateur de toutes les routes
│   ├── auth.routes.js                # Routes authentification (register, login, refresh)
│   ├── patient.routes.js             # Routes profil patient
│   ├── traitement.routes.js          # Routes gestion des traitements (CRUD)
│   ├── prise.routes.js               # Routes prises médicamenteuses
│   ├── ordonnance.routes.js          # Routes scan d'ordonnance
│   └── statistique.routes.js         # Routes statistiques et observance
│
├── services/
│   ├── auth.service.js               # Logique inscription, connexion, JWT
│   ├── patient.service.js            # Logique profil patient
│   ├── traitement.service.js         # Logique CRUD traitements + génération prises
│   ├── prise.service.js              # Logique prises du jour, confirmation, historique
│   ├── ordonnance.service.js         # Logique upload + OCR (placeholder)
│   ├── horaire.service.js            # Algorithme d'adaptation des horaires
│   ├── observance.service.js         # Algorithme de détection de non-observance
│   └── notification.service.js       # Logique notifications / rappels (placeholder FCM)
│
├── middlewares/
│   ├── auth.middleware.js             # Vérification du token JWT
│   ├── validation.middleware.js       # Validation des requêtes avec Joi
│   └── error.middleware.js            # Gestion centralisée des erreurs
│
├── utils/
│   ├── constants.js                   # Constantes (statuts, niveaux de risque, seuils)
│   └── helpers.js                     # Fonctions utilitaires (parsing horaires)
│
└── uploads/                           # Dossier d'upload des ordonnances (non versionné)
```

---

## Installation

### Prérequis

- **Node.js** v18+
- **MySQL** 8+
- **npm** ou **yarn**

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd e-sante-backend
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Copier le fichier `.env.example` en `.env` et renseigner les valeurs :

```bash
cp .env.example .env
```

```env
# Serveur
PORT=3000
NODE_ENV=development

# Base de données MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=e_sante
DB_USER=root
DB_PASSWORD=votre_mot_de_passe

# JWT
JWT_SECRET=votre_cle_secrete_ici
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### 4. Créer la base de données MySQL

```sql
CREATE DATABASE e_sante CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Lancer le serveur

```bash
# Mode développement (avec nodemon)
npm run dev

# Mode production
npm start
```

### 6. Accéder à l'application

| URL | Description |
|---|---|
| `http://localhost:3000` | Racine de l'API |
| `http://localhost:3000/api-docs` | Documentation Swagger |
| `http://localhost:3000/api` | Préfixe de toutes les routes |

---

## Endpoints API

### Authentification

| Méthode | Route | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Inscription d'un nouveau patient | Non |
| `POST` | `/api/auth/login` | Connexion (retourne JWT) | Non |
| `POST` | `/api/auth/refresh` | Rafraîchir le token JWT | Non |

### Patient

| Méthode | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/patients/profile` | Récupérer le profil du patient connecté | Oui |
| `PUT` | `/api/patients/profile` | Modifier le profil | Oui |
| `PUT` | `/api/patients/parametres-vie` | Modifier les horaires de vie (réveil, coucher, repas) | Oui |

### Traitements

| Méthode | Route | Description | Auth |
|---|---|---|---|
| `POST` | `/api/traitements` | Ajouter un traitement manuellement | Oui |
| `GET` | `/api/traitements` | Liste des traitements du patient | Oui |
| `GET` | `/api/traitements/:id` | Détail d'un traitement | Oui |
| `PUT` | `/api/traitements/:id` | Modifier un traitement | Oui |
| `PATCH` | `/api/traitements/:id/statut` | Changer le statut (actif/terminé/arrêté) | Oui |
| `DELETE` | `/api/traitements/:id` | Supprimer un traitement | Oui |

### Prises Médicamenteuses

| Méthode | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/prises/aujourd-hui` | Prises du jour avec statut | Oui |
| `POST` | `/api/prises/:id/confirmer` | Confirmer une prise (pris/oublié/reporté) | Oui |
| `GET` | `/api/prises/historique` | Historique des prises (paginé, filtrable) | Oui |

### Ordonnances

| Méthode | Route | Description | Auth |
|---|---|---|---|
| `POST` | `/api/ordonnances/scan` | Upload et scan OCR d'une ordonnance | Oui |
| `POST` | `/api/ordonnances/:id/valider` | Valider le scan et créer les traitements | Oui |
| `GET` | `/api/ordonnances` | Liste des ordonnances du patient | Oui |

### Statistiques & Observance

| Méthode | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/statistiques/observance` | Score d'observance global (paramètre: jours) | Oui |
| `GET` | `/api/statistiques/tendances` | Tendances hebdomadaires et mensuelles | Oui |
| `GET` | `/api/statistiques/risque` | Niveau de risque + actions recommandées | Oui |

---

## Modèle de Données

### Schéma des relations

```
Patient (1) ──── (N) Traitement
   │                      │
   │                      └── (1) ──── (N) PriseProgrammee
   │                                            │
   │                                            └── (1) ──── (N) HistoriquePrise
   │
   └── (1) ──── (N) Ordonnance
```

### Table `patients`

| Champ | Type | Description |
|---|---|---|
| id | UUID (PK) | Identifiant unique |
| email | VARCHAR(255) | Email de connexion (unique) |
| password_hash | VARCHAR(255) | Mot de passe hashé (bcrypt) |
| nom | VARCHAR(100) | Nom du patient |
| prenom | VARCHAR(100) | Prénom du patient |
| date_naissance | DATE | Date de naissance |
| telephone | VARCHAR(20) | Numéro de téléphone |
| contact_urgence | VARCHAR(255) | Contact d'urgence |
| heure_reveil | TIME | Heure habituelle de réveil |
| heure_coucher | TIME | Heure habituelle de coucher |
| horaires_repas | JSON | `{"petit_dejeuner": "08:00", "dejeuner": "12:30", "diner": "19:30"}` |
| allergies | JSON | Liste des allergies |
| pathologies | JSON | Liste des pathologies chroniques |
| preferences_notification | JSON | Préférences de rappels |

### Table `traitements`

| Champ | Type | Description |
|---|---|---|
| id | UUID (PK) | Identifiant unique |
| patient_id | UUID (FK) | Référence au patient |
| nom_medicament | VARCHAR(255) | Nom du médicament |
| dosage | VARCHAR(50) | Ex: "500mg" |
| forme | ENUM | comprime, gelule, sirop, injection, patch, gouttes, pommade, suppositoire, inhalateur, autre |
| frequence | VARCHAR(100) | Ex: "3" (fois par jour) |
| instructions | TEXT | Ex: "avec repas", "à jeun" |
| date_debut | DATE | Date de début du traitement |
| date_fin | DATE | Date de fin (NULL si indéfini) |
| statut | ENUM | actif, termine, arrete |

### Table `prises_programmees`

| Champ | Type | Description |
|---|---|---|
| id | UUID (PK) | Identifiant unique |
| traitement_id | UUID (FK) | Référence au traitement |
| heure_prise | TIME | Heure programmée |
| jour_semaine | ENUM | lundi-dimanche (NULL = tous les jours) |

### Table `historique_prises`

| Champ | Type | Description |
|---|---|---|
| id | UUID (PK) | Identifiant unique |
| prise_programmee_id | UUID (FK) | Référence à la prise programmée |
| patient_id | UUID (FK) | Référence au patient |
| date_heure_prevue | DATETIME | Moment prévu |
| date_heure_reelle | DATETIME | Moment réel (NULL si oubli) |
| statut | ENUM | pris, oublie, retard, reporte |
| retard_minutes | INTEGER | Minutes de retard |

### Table `ordonnances`

| Champ | Type | Description |
|---|---|---|
| id | UUID (PK) | Identifiant unique |
| patient_id | UUID (FK) | Référence au patient |
| image_url | VARCHAR(500) | Chemin de l'image uploadée |
| texte_extrait | TEXT | Texte brut extrait par OCR |
| donnees_parsees | JSON | Données structurées (médicaments, dosages) |
| date_scan | DATETIME | Date du scan |
| statut | ENUM | en_cours, validee, rejetee |

---

## Algorithmes Implémentés

### 1. Adaptation Intelligente des Horaires

Le service `horaire.service.js` génère automatiquement des horaires de prise optimaux selon :

- Les **horaires de vie** du patient (réveil, coucher, repas)
- Les **instructions** du médicament (avec repas, à jeun, au coucher, le matin)
- La **fréquence** prescrite

**Exemples :**

| Prescription | Horaires générés |
|---|---|
| "3 fois par jour, avec repas" | 08:00, 12:30, 19:30 (calés sur les repas) |
| "2 fois par jour, à jeun" | 07:30, 19:00 (30 min avant petit-déj et dîner) |
| "1 fois par jour, au coucher" | 22:30 (30 min avant coucher) |
| "2 fois par jour" (sans instruction) | Répartition uniforme sur la période d'éveil |

### 2. Détection de Non-Observance

Le service `observance.service.js` analyse en continu le comportement du patient :

**Score d'observance** = (Prises confirmées / Prises attendues) x 100

**Niveaux de risque :**

| Niveau | Score | Couleur | Actions |
|---|---|---|---|
| Faible | > 85% | Vert | Encouragements positifs |
| Modéré | 70-85% | Orange | Messages de motivation, ajustement rappels |
| Élevé | < 70% | Rouge | Alerte, proposition contact médecin, intensification rappels |

**Détection des patterns d'oubli :**
- Par jour de la semaine (ex: plus d'oublis le week-end)
- Par moment de la journée (matin, midi, soir)
- Tendances sur 7 jours et 4 semaines

---

## Sécurité

| Mesure | Implémentation |
|---|---|
| Hachage mots de passe | bcrypt avec 12 salt rounds |
| Authentification | JWT (access token 24h + refresh token 7j) |
| Rate limiting | 100 requêtes / 15 min par IP |
| Headers sécurisés | Helmet (X-Frame-Options, CSP, HSTS...) |
| Validation entrées | Joi sur toutes les routes POST/PUT |
| CORS | Activé et configurable |
| Gestion d'erreurs | Middleware centralisé, pas de stack trace en production |

---

## Scripts

```bash
# Démarrer en production
npm start

# Démarrer en développement (hot reload)
npm run dev
```

---

## Exemples d'Utilisation (cURL)

### Inscription

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "MonMotDePasse123",
    "nom": "Dupont",
    "prenom": "Jean",
    "date_naissance": "1990-05-15"
  }'
```

### Connexion

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "MonMotDePasse123"
  }'
```

### Ajouter un traitement

```bash
curl -X POST http://localhost:3000/api/traitements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -d '{
    "nom_medicament": "Doliprane",
    "dosage": "500mg",
    "forme": "comprime",
    "frequence": "3",
    "instructions": "avec repas"
  }'
```

### Confirmer une prise

```bash
curl -X POST http://localhost:3000/api/prises/ID_PRISE/confirmer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -d '{"statut": "pris"}'
```

### Consulter le score d'observance

```bash
curl -X GET "http://localhost:3000/api/statistiques/observance?jours=30" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

---

## Auteur

**E-SANTE** - Projet Electif E-Santé / Santé Pharmaceutique
