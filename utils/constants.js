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

module.exports = {
  STATUT_TRAITEMENT,
  STATUT_PRISE,
  STATUT_ORDONNANCE,
  NIVEAU_RISQUE,
  SEUIL_RETARD_MINUTES,
  FORMES_MEDICAMENT,
  JOURS_SEMAINE,
};
