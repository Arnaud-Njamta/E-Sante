// Statuts des traitements
const STATUT_TRAITEMENT = {
  ACTIF: 'actif',
  TERMINE: 'termine',
  ARRETE: 'arrete',
};

// Statuts des prises
const STATUT_PRISE = {
  PRIS: 'pris',
  OUBLIE: 'oublie',
  RETARD: 'retard',
  REPORTE: 'reporte',
};

// Statuts des ordonnances
const STATUT_ORDONNANCE = {
  EN_COURS: 'en_cours',
  VALIDEE: 'validee',
  REJETEE: 'rejetee',
};

// Niveaux de risque d'observance
const NIVEAU_RISQUE = {
  FAIBLE: { label: 'faible', seuil_min: 85, couleur: 'vert' },
  MODERE: { label: 'modere', seuil_min: 70, seuil_max: 85, couleur: 'orange' },
  ELEVE: { label: 'eleve', seuil_max: 70, couleur: 'rouge' },
};

// Seuil de retard (en minutes) pour classifier une prise comme "en retard"
const SEUIL_RETARD_MINUTES = 30;

// Formes de médicaments
const FORMES_MEDICAMENT = [
  'comprime', 'gelule', 'sirop', 'injection', 'patch',
  'gouttes', 'pommade', 'suppositoire', 'inhalateur', 'autre',
];

// Jours de la semaine
const JOURS_SEMAINE = [
  'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche',
];

// Types d'établissements de santé
const TYPE_ETABLISSEMENT = {
  PHARMACIE: 'pharmacie',
  HOPITAL: 'hopital',
  CLINIQUE: 'clinique',
};

// Note par défaut (5 étoiles) avant les premiers avis
const NOTE_DEFAUT = 5.0;

// Types de cibles pour les avis
const TYPE_CIBLE_AVIS = {
  ETABLISSEMENT: 'etablissement',
  MEDECIN: 'medecin',
};

// Statuts de conversation pharmacie
const STATUT_CONVERSATION = {
  OUVERTE: 'ouverte',
  FERMEE: 'fermee',
};

// Rôles utilisateurs
const USER_ROLES = {
  PATIENT: 'patient',
  MEDECIN: 'medecin',
  PHARMACIE: 'pharmacie',
  HOPITAL: 'hopital',
  CLINIQUE: 'clinique',
  ADMIN: 'admin',
};

/** Professions de santé (compte type médecin / soignant) */
const PROFESSION_SANTE = {
  MEDECIN: 'medecin',
  INFIRMIER: 'infirmier',
  AIDE_SOIGNANT: 'aide_soignant',
  SAGE_FEMME: 'sage_femme',
  KINESITHERAPEUTE: 'kinesitherapeute',
};

const PROFESSION_SANTE_LABELS = {
  medecin: 'Médecin',
  infirmier: 'Infirmier / Infirmière',
  aide_soignant: 'Aide-soignant(e)',
  sage_femme: 'Sage-femme',
  kinesitherapeute: 'Kinésithérapeute',
};

/** Types d'inscription pro (structures + soignants) */
const TYPE_INSCRIPTION_PRO = [
  'medecin',
  'infirmier',
  'aide_soignant',
  'sage_femme',
  'kinesitherapeute',
  'pharmacie',
  'hopital',
  'clinique',
];

const SOIGNANT_TYPES = [
  'medecin',
  'infirmier',
  'aide_soignant',
  'sage_femme',
  'kinesitherapeute',
];


// Statuts validation comptes professionnels
const STATUT_VALIDATION = {
  EN_ATTENTE: 'en_attente',
  VALIDE: 'valide',
  REJETE: 'rejete',
  SUSPENDU: 'suspendu',
};

// Statuts rendez-vous
const STATUT_RDV = {
  EN_ATTENTE: 'en_attente',
  CONFIRME: 'confirme',
  CONTRE_PROPOSITION: 'contre_proposition',
  ANNULE: 'annule',
  TERMINE: 'termine',
  ABSENT: 'absent',
};

// Statuts ordonnance électronique
const STATUT_ORDONNANCE_ELEC = {
  BROUILLON: 'brouillon',
  SIGNEE: 'signee',
  DELIVREE: 'delivree',
  EXPIREE: 'expiree',
  ANNULEE: 'annulee',
};

// Types de fichiers blob
const TYPE_FICHIER = {
  PHOTO_PROFIL: 'photo_profil',
  CACHET: 'cachet',
  SIGNATURE: 'signature',
  DOCUMENT: 'document',
  PRODUIT: 'produit',
  ORDONNANCE_PDF: 'ordonnance_pdf',
  DIPLOME: 'diplome',
  CARTE_ORDRE: 'carte_ordre',
  AGREMENT: 'agrement',
  AUTORISATION: 'autorisation',
};

// Régions du Cameroun (10 régions)
const REGIONS_CAMEROUN = [
  'Adamaoua', 'Centre', 'Est', 'Extrême-Nord', 'Littoral',
  'Nord', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Ouest',
];

// Alias rétrocompatibilité
const REGIONS_SENEGAL = REGIONS_CAMEROUN;

// Statuts réservation dispensaire
const STATUT_RESERVATION = {
  EN_ATTENTE: 'en_attente',
  CONFIRMEE: 'confirmee',
  REFUSEE: 'refusee',
  PRETE: 'prete',
  RETIREE: 'retiree',
  ANNULEE: 'annulee',
};

// Consentements RGPD / santé (Cameroun — Loi n° 2010/012, secret médical)
const POLITIQUE_CONFIDENTIALITE_VERSION = '2026-01';

const CONSENTEMENT_TYPES = {
  POLITIQUE: 'politique_confidentialite',
  CARNET_ACTIVATION: 'carnet_medical_activation',
  PARTAGE_CARNET_RDV: 'partage_carnet_rdv',
  PARTAGE_CARNET_MEDECIN: 'partage_carnet_medecin',
  TELECONSULTATION: 'teleconsultation',
};

module.exports = {
  STATUT_TRAITEMENT,
  STATUT_PRISE,
  STATUT_ORDONNANCE,
  NIVEAU_RISQUE,
  SEUIL_RETARD_MINUTES,
  FORMES_MEDICAMENT,
  JOURS_SEMAINE,
  TYPE_ETABLISSEMENT,
  NOTE_DEFAUT,
  TYPE_CIBLE_AVIS,
  STATUT_CONVERSATION,
  USER_ROLES,
  PROFESSION_SANTE,
  PROFESSION_SANTE_LABELS,
  TYPE_INSCRIPTION_PRO,
  SOIGNANT_TYPES,
  STATUT_VALIDATION,
  STATUT_RDV,
  STATUT_ORDONNANCE_ELEC,
  TYPE_FICHIER,
  REGIONS_SENEGAL,
  REGIONS_CAMEROUN,
  STATUT_RESERVATION,
  POLITIQUE_CONFIDENTIALITE_VERSION,
  CONSENTEMENT_TYPES,
};
