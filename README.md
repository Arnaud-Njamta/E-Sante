<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-8+-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/License-ISC-blue?style=for-the-badge" />
</p>

# 💊 E-SANTÉ — Plateforme d'Observance Thérapeutique

> Application fullstack permettant aux patients de **gérer leurs traitements**, **scanner leurs ordonnances**, **recevoir des rappels intelligents** et **suivre leur observance** en temps réel grâce à des algorithmes d'analyse personnalisés.

---

## 📋 Table des Matières

- [Fonctionnalités](#-fonctionnalités)
- [Démo & Captures d'écran](#-démo--captures-décran)
- [Architecture](#-architecture)
- [Stack Technique](#-stack-technique)
- [Installation & Lancement](#-installation--lancement)
- [Structure du Projet](#-structure-du-projet)
- [Endpoints API](#-endpoints-api)
- [Modèle de Données](#-modèle-de-données)
- [Algorithmes](#-algorithmes-implémentés)
- [Sécurité](#-sécurité)
- [Exemples d'utilisation](#-exemples-dutilisation-curl)
- [Auteur](#-auteur)

---

## ✨ Fonctionnalités

### 🩺 Gestion des Traitements
- Ajout, modification et suppression de traitements médicamenteux
- Support de 10 formes galéniques (comprimé, gélule, sirop, injection, patch, gouttes, pommade, suppositoire, inhalateur, autre)
- Gestion des statuts (actif, terminé, arrêté)
- Génération automatique des horaires de prise selon le profil patient

### 📸 Scan d'Ordonnances
- Upload d'ordonnances au format image
- Extraction OCR des données (médicaments, dosages, fréquences)
- Validation manuelle avec corrections avant création des traitements

### ⏰ Suivi des Prises
- Planning journalier intelligent regroupé par moment de la journée (matin, midi, soir)
- Confirmation, report ou déclaration d'oubli de chaque prise
- Historique complet des prises avec pagination

### 📊 Statistiques & Analyse
- **Score d'observance** global sur période configurable (7, 14, 30 jours)
- **Indicateur de risque** avec classification (faible / modéré / élevé)
- **Tendances** hebdomadaires et mensuelles avec graphiques interactifs
- **Détection de patterns** d'oubli (par jour, par heure)
- **Recommandations personnalisées** basées sur le comportement

### 🔐 Authentification & Sécurité
- Inscription / connexion avec JWT (access token + refresh token)
- Réinitialisation de mot de passe par email
- Rate limiting, headers sécurisés, validation des entrées

### 🎨 Interface Utilisateur
- Design moderne et responsive (mobile-first)
- Mode sombre / clair
- Animations fluides et micro-interactions
- Composants UI réutilisables (Card, Button, Modal, Badge, Input, Spinner…)
- Graphiques interactifs avec Recharts

---

## 🖼️ Démo & Captures d'écran

### Tableau de Bord
Le dashboard présente une vue d'ensemble : score d'observance, indicateur de risque, tendance hebdomadaire et planning des prises du jour.

### Page Médicaments
Gestion complète des traitements avec filtrage (tous, actifs, terminés, arrêtés), recherche et formulaire d'ajout.

### Page Statistiques
Visualisation détaillée : jauge de risque, graphique de tendance, observations et recommandations personnalisées.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                        FRONTEND                          │
│              React 19 + Vite 7 + React Query             │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │Dashboard │ │Médica-   │ │Prises    │ │Statis-   │    │
│  │Page      │ │ments Page│ │Page      │ │tiques    │    │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘    │
│       │             │            │             │          │
│  ┌────┴─────────────┴────────────┴─────────────┴─────┐   │
│  │      Custom Hooks (useTraitements, usePrises,     │   │
│  │      useStats, useOrdonnances, usePatient)        │   │
│  └────────────────────┬──────────────────────────────┘   │
│                       │                                  │
│  ┌────────────────────┴──────────────────────────────┐   │
│  │         Axios Client + JWT Interceptors           │   │
│  └────────────────────┬──────────────────────────────┘   │
└───────────────────────┼──────────────────────────────────┘
                        │  HTTP (REST API)
┌───────────────────────┼──────────────────────────────────┐
│                       │          BACKEND                 │
│              Express 5 + Sequelize + MySQL                │
│                       │                                  │
│  ┌────────────────────┴──────────────────────────────┐   │
│  │          Middlewares (Auth, Validation, CORS,     │   │
│  │          Helmet, Rate Limit, Error Handler)       │   │
│  └────────────────────┬──────────────────────────────┘   │
│                       │                                  │
│  ┌──────────┐ ┌───────┴──┐ ┌──────────┐                 │
│  │  Routes  │→│Controllers│→│ Services │                 │
│  └──────────┘ └──────────┘ └────┬─────┘                 │
│                                  │                       │
│  ┌───────────────────────────────┴───────────────────┐   │
│  │     Models (Patient, Traitement, PriseProgrammee, │   │
│  │     HistoriquePrise, Ordonnance)                  │   │
│  └────────────────────┬──────────────────────────────┘   │
│                       │                                  │
│              ┌────────┴────────┐                         │
│              │   MySQL 8+     │                          │
│              │   (e_sante)    │                          │
│              └─────────────────┘                         │
└──────────────────────────────────────────────────────────┘
```

---

## 🔧 Stack Technique

### Backend

| Technologie | Version | Rôle |
|---|---|---|
| **Express.js** | 5.x | Framework API REST |
| **Sequelize** | 6.x | ORM pour MySQL |
| **MySQL** | 8+ | Base de données relationnelle |
| **bcrypt** | 6.x | Hachage des mots de passe (12 rounds) |
| **jsonwebtoken** | 9.x | Authentification JWT (access + refresh token) |
| **Joi** | 18.x | Validation des données entrantes |
| **Multer** | 2.x | Upload de fichiers (ordonnances) |
| **Nodemailer** | 8.x | Envoi d'emails (réinitialisation mot de passe) |
| **Swagger** | 6.x | Documentation interactive de l'API |
| **Helmet** | 8.x | Sécurité HTTP headers |
| **express-rate-limit** | 8.x | Protection contre le brute force |
| **Morgan** | 1.x | Logging des requêtes HTTP |

### Frontend

| Technologie | Version | Rôle |
|---|---|---|
| **React** | 19 | Librairie UI |
| **Vite** | 7.x | Build tool & dev server |
| **React Router** | 6.x | Navigation SPA |
| **React Query** | 5.x | State management & cache serveur |
| **Axios** | 1.x | Client HTTP avec interceptors JWT |
| **Styled Components** | 6.x | CSS-in-JS dynamique & thèmes |
| **React Hook Form** | 7.x | Gestion de formulaires performante |
| **Recharts** | 3.x | Graphiques interactifs (courbes, aires) |
| **Lucide React** | 0.575 | Icônes SVG |
| **React Hot Toast** | 2.x | Notifications toast |

---

## 🚀 Installation & Lancement

### Prérequis

- **Node.js** v18+
- **MySQL** 8+ (en cours d'exécution)
- **npm** v9+

### 1. Cloner le projet

```bash
git clone https://github.com/Kanounou/DjamSante.git
cd DjamSante
```

### 2. Installer les dépendances

```bash
# Backend (racine du projet)
npm install

# Frontend
cd Front
npm install
cd ..
```

### 3. Configurer l'environnement

Copier `.env.example` en `.env` à la racine et renseigner les valeurs :

```env
# ─── Serveur ───
PORT=3000
NODE_ENV=development

# ─── Base de données MySQL ───
DB_HOST=localhost
DB_PORT=3306
DB_NAME=e_sante
DB_USER=root
DB_PASSWORD=votre_mot_de_passe

# ─── JWT ───
JWT_SECRET=votre_cle_secrete_tres_longue_et_aleatoire
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# ─── Upload ───
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# ─── Email (SMTP) ───
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=votre_smtp_password
SMTP_FROM=DjamSante <noreply@e-sante.com>

# ─── Frontend ───
FRONTEND_URL=http://localhost:5173
```

Le frontend utilise un fichier `.env` optionnel dans `Front/` :

```env
VITE_API_URL=http://localhost:3000/api
```

> Par défaut, le frontend appelle `http://localhost:3000/api`.

### 4. Créer la base de données MySQL

```sql
CREATE DATABASE e_sante CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

> Les tables sont créées automatiquement au démarrage du serveur grâce à Sequelize `sync({ alter: true })`.

### 5. Lancer l'application

```bash
# Terminal 1 — Backend (port 3000)
npm start
# ou en mode développement :
npm run dev

# Terminal 2 — Frontend (port 5173)
cd Front
npm run dev
```

### 6. Accéder à l'application

| URL | Description |
|---|---|
| `http://localhost:5173` | 🖥️ Interface utilisateur (React) |
| `http://localhost:3000/api-docs` | 📄 Documentation Swagger |
| `http://localhost:3000/api` | 🔌 Racine de l'API REST |

---

## 📁 Structure du Projet

```
DjamSante/
│
├── index.js                          # Point d'entrée du serveur Express
├── package.json                      # Dépendances backend & scripts
├── .env                              # Variables d'environnement (non versionné)
├── .env.example                      # Template des variables d'environnement
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
│   ├── index.js                      # Agrégateur des routes → /api
│   ├── auth.routes.js                # /api/auth (register, login, refresh, forgot)
│   ├── patient.routes.js             # /api/patients (profile, parametres-vie)
│   ├── traitement.routes.js          # /api/traitements (CRUD + statut)
│   ├── prise.routes.js               # /api/prises (aujourd-hui, confirmer, historique)
│   ├── ordonnance.routes.js          # /api/ordonnances (scan, valider, lister)
│   └── statistique.routes.js         # /api/statistiques (observance, tendances, risque)
│
├── services/
│   ├── auth.service.js               # Logique inscription, connexion, JWT, reset password
│   ├── patient.service.js            # Logique profil patient
│   ├── traitement.service.js         # Logique CRUD traitements + génération prises
│   ├── prise.service.js              # Logique prises du jour, confirmation, historique
│   ├── ordonnance.service.js         # Logique upload + OCR (placeholder)
│   ├── horaire.service.js            # Algorithme d'adaptation des horaires
│   ├── observance.service.js         # Algorithme de détection de non-observance
│   └── notification.service.js       # Logique notifications / rappels (placeholder)
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
├── uploads/                           # Dossier d'upload des ordonnances (non versionné)
│
└── Front/                             # Application React (frontend)
    ├── package.json                   # Dépendances frontend
    ├── vite.config.js                 # Configuration Vite
    ├── index.html                     # Point d'entrée HTML
    │
    └── src/
        ├── App.jsx                    # Router principal + providers
        ├── main.jsx                   # Bootstrap React
        │
        ├── api/
        │   ├── client.js              # Instance Axios + interceptors JWT
        │   └── endpoints.js           # Définition centralisée des URLs API
        │
        ├── context/
        │   ├── AuthContext.jsx         # State d'authentification global
        │   └── ThemeContext.jsx        # Gestion du thème (clair/sombre)
        │
        ├── hooks/
        │   ├── useTraitements.js       # CRUD traitements (React Query)
        │   ├── usePrises.js            # Prises du jour, confirmer, historique
        │   ├── useOrdonnances.js       # Scan, validation, liste ordonnances
        │   ├── useStats.js             # Observance, tendances, risque
        │   └── usePatient.js           # Mise à jour profil & paramètres de vie
        │
        ├── pages/
        │   ├── LoginPage.jsx           # Page de connexion
        │   ├── RegisterPage.jsx        # Page d'inscription
        │   ├── DashboardPage.jsx       # Tableau de bord principal
        │   ├── MedicationsPage.jsx     # Gestion des médicaments
        │   ├── PrisesPage.jsx          # Planning des prises du jour
        │   ├── OrdonnancePage.jsx      # Scan d'ordonnances
        │   ├── AnalyticsPage.jsx       # Statistiques détaillées
        │   └── ProfilePage.jsx         # Profil utilisateur
        │
        ├── components/
        │   ├── layout/
        │   │   ├── Sidebar.jsx         # Barre de navigation latérale
        │   │   └── Layout.jsx          # Layout principal (sidebar + content)
        │   └── ui/                     # Composants UI réutilisables
        │       ├── Button.jsx          # Bouton avec variantes et icônes
        │       ├── Card.jsx            # Carte avec animation d'entrée
        │       ├── Input.jsx           # Champ de saisie avec label et erreur
        │       ├── Modal.jsx           # Modale de dialogue
        │       ├── Badge.jsx           # Badge coloré
        │       ├── Spinner.jsx         # Indicateur de chargement
        │       ├── EmptyState.jsx      # État vide
        │       └── ErrorState.jsx      # État d'erreur avec retry
        │
        ├── styles/
        │   └── theme.js               # Tokens de design (couleurs, espacements, radii)
        │
        └── utils/
            └── ProtectedRoute.jsx      # Guard d'authentification
```

---

## 🌐 Endpoints API

### 🔑 Authentification

| Méthode | Route | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Inscription d'un patient | ❌ |
| `POST` | `/api/auth/login` | Connexion (retourne JWT) | ❌ |
| `POST` | `/api/auth/refresh` | Rafraîchir le token JWT | ❌ |
| `POST` | `/api/auth/forgot-password` | Demande de réinitialisation | ❌ |
| `POST` | `/api/auth/reset-password` | Réinitialisation du mot de passe | ❌ |

### 👤 Patient

| Méthode | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/patients/profile` | Récupérer le profil connecté | ✅ |
| `PUT` | `/api/patients/profile` | Modifier le profil | ✅ |
| `PUT` | `/api/patients/parametres-vie` | Modifier les horaires de vie | ✅ |

### 💊 Traitements

| Méthode | Route | Description | Auth |
|---|---|---|---|
| `POST` | `/api/traitements` | Ajouter un traitement | ✅ |
| `GET` | `/api/traitements` | Liste des traitements du patient | ✅ |
| `GET` | `/api/traitements/:id` | Détail d'un traitement | ✅ |
| `PUT` | `/api/traitements/:id` | Modifier un traitement | ✅ |
| `PATCH` | `/api/traitements/:id/statut` | Changer le statut | ✅ |
| `DELETE` | `/api/traitements/:id` | Supprimer un traitement | ✅ |

### ⏰ Prises Médicamenteuses

| Méthode | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/prises/aujourd-hui` | Prises du jour avec statut | ✅ |
| `POST` | `/api/prises/:id/confirmer` | Confirmer une prise | ✅ |
| `GET` | `/api/prises/historique` | Historique paginé et filtrable | ✅ |

### 📄 Ordonnances

| Méthode | Route | Description | Auth |
|---|---|---|---|
| `POST` | `/api/ordonnances/scan` | Upload + scan OCR | ✅ |
| `POST` | `/api/ordonnances/:id/valider` | Valider et créer les traitements | ✅ |
| `GET` | `/api/ordonnances` | Liste des ordonnances | ✅ |

### 📊 Statistiques & Observance

| Méthode | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/statistiques/observance` | Score d'observance (paramètre: `jours`) | ✅ |
| `GET` | `/api/statistiques/tendances` | Tendances hebdomadaires et mensuelles | ✅ |
| `GET` | `/api/statistiques/risque` | Niveau de risque + recommandations | ✅ |

---

## 🗃️ Modèle de Données

### Schéma Relationnel

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
| `id` | UUID (PK) | Identifiant unique |
| `email` | VARCHAR(255) | Email unique de connexion |
| `password_hash` | VARCHAR(255) | Mot de passe hashé (bcrypt, 12 rounds) |
| `nom` / `prenom` | VARCHAR(100) | Identité du patient |
| `date_naissance` | DATE | Date de naissance |
| `telephone` | VARCHAR(20) | Numéro de téléphone |
| `heure_reveil` / `heure_coucher` | TIME | Rythme de vie |
| `horaires_repas` | JSON | `{"petit_dejeuner": "08:00", "dejeuner": "12:30", "diner": "19:30"}` |
| `allergies` / `pathologies` | JSON | Données médicales |
| `preferences_notification` | JSON | Préférences de rappels |

### Table `traitements`

| Champ | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Identifiant unique |
| `patient_id` | UUID (FK) | Référence au patient |
| `nom_medicament` | VARCHAR(255) | Nom du médicament |
| `dosage` | VARCHAR(50) | Ex: `500mg` |
| `forme` | ENUM | `comprime`, `gelule`, `sirop`, `injection`, `patch`, `gouttes`, `pommade`, `suppositoire`, `inhalateur`, `autre` |
| `frequence` | VARCHAR(100) | Nombre de prises par jour |
| `instructions` | TEXT | Ex: `avec repas`, `à jeun` |
| `date_debut` / `date_fin` | DATE | Période du traitement |
| `statut` | ENUM | `actif`, `termine`, `arrete` |

### Table `prises_programmees`

| Champ | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Identifiant unique |
| `traitement_id` | UUID (FK) | Référence au traitement |
| `heure_prise` | TIME | Heure programmée |
| `jour_semaine` | ENUM | `lundi`–`dimanche` (NULL = tous les jours) |

### Table `historique_prises`

| Champ | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Identifiant unique |
| `prise_programmee_id` | UUID (FK) | Référence à la prise |
| `patient_id` | UUID (FK) | Référence au patient |
| `date_heure_prevue` | DATETIME | Moment prévu |
| `date_heure_reelle` | DATETIME | Moment réel (NULL si oubli) |
| `statut` | ENUM | `pris`, `oublie`, `retard`, `reporte` |
| `retard_minutes` | INTEGER | Minutes de retard (défaut: 0) |

### Table `ordonnances`

| Champ | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Identifiant unique |
| `patient_id` | UUID (FK) | Référence au patient |
| `image_url` | VARCHAR(500) | Chemin de l'image uploadée |
| `texte_extrait` | TEXT | Texte brut extrait par OCR |
| `donnees_parsees` | JSON | Données structurées extraites |
| `statut` | ENUM | `en_cours`, `validee`, `rejetee` |

---

## 🧠 Algorithmes Implémentés

### 1. Adaptation Intelligente des Horaires de Prise

Le service `horaire.service.js` génère automatiquement des horaires optimaux en croisant :
- Les **horaires de vie** du patient (réveil, coucher, repas)
- Les **instructions** du médicament (avec repas, à jeun, au coucher, le matin)
- La **fréquence** prescrite

| Prescription | Horaires Générés |
|---|---|
| 3x/jour, **avec repas** | 08:00, 12:30, 19:30 *(calés sur les repas)* |
| 2x/jour, **à jeun** | 07:30, 19:00 *(30 min avant repas)* |
| 1x/jour, **au coucher** | 22:30 *(30 min avant coucher)* |
| 2x/jour *(sans instruction)* | Répartition uniforme sur la période d'éveil |

### 2. Détection de Non-Observance

Le service `observance.service.js` analyse le comportement du patient :

**Score d'observance** = `(Prises confirmées / Prises attendues) × 100`

| Niveau de Risque | Score | Couleur | Actions Déclenchées |
|---|---|---|---|
| 🟢 Faible | > 85% | Vert | Encouragements positifs |
| 🟡 Modéré | 70–85% | Orange | Messages de motivation, ajustement des rappels |
| 🔴 Élevé | < 70% | Rouge | Alerte, proposition de contact médecin, intensification |

**Détection des patterns d'oubli :**
- Par **jour de la semaine** (ex: plus d'oublis le week-end)
- Par **moment de la journée** (matin, midi, soir)
- **Tendances** sur 7 jours et 4 semaines

---

## 🔒 Sécurité

| Mesure | Implémentation |
|---|---|
| Hachage mots de passe | `bcrypt` avec 12 salt rounds |
| Authentification | JWT — access token (24h) + refresh token (7j) |
| Rate limiting | 100 requêtes / 15 minutes par IP |
| Headers sécurisés | `helmet` (X-Frame-Options, CSP, HSTS…) |
| Validation des entrées | `Joi` côté backend + `React Hook Form` côté frontend |
| CORS | Configuré pour le frontend autorisé |
| Gestion d'erreurs | Middleware centralisé, pas de stack trace en production |
| Réinitialisation sécurisée | Token crypto aléatoire avec expiration (1h) |

---

## 📡 Frontend — Flux de Données

```
Composant Page
     │
     ▼
 Custom Hook (React Query)
     │
     ├── useQuery  → GET → Cache automatique + revalidation
     └── useMutation → POST/PUT/DELETE → Invalidation du cache
     │
     ▼
 Axios Client (client.js)
     │
     ├── Request Interceptor  → Ajoute le JWT Bearer token
     └── Response Interceptor → Refresh automatique si 401
     │
     ▼
 Backend Express → Controller → Service → Sequelize → MySQL
```

---

## 📟 Scripts

```bash
# ─── Backend ───
npm start              # Démarrer en production
npm run dev            # Démarrer avec hot-reload (nodemon)

# ─── Frontend ───
cd Front
npm run dev            # Serveur de développement Vite (port 5173)
npm run build          # Build de production
npm run preview        # Prévisualisation du build
```

---

## 📝 Exemples d'Utilisation (cURL)

### Inscription

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "MonMotDePasse123",
    "nom": "Dupont",
    "prenom": "Jean",
    "date_naissance": "1990-05-15",
    "telephone": "0612345678"
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

### Réinitialiser le mot de passe

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "patient@example.com"}'
```

---

## 🗺️ Roadmap

- [ ] Intégration OCR réelle (Tesseract / Google Vision)
- [ ] Notifications push (Firebase Cloud Messaging)
- [ ] Authentification à deux facteurs (2FA)
- [ ] Export PDF des rapports d'observance
- [ ] Application mobile React Native
- [ ] Intégration avec des systèmes de pharmacie
- [ ] Chatbot santé avec IA

---

## 👨‍💻 Auteur

**Kanounou** — Projet Électif DjamSanté / Santé Pharmaceutique

📦 [GitHub Repository](https://github.com/Kanounou/DjamSante)

---

<p align="center">
  Fait avec ❤️ pour améliorer la santé des patients
</p>
