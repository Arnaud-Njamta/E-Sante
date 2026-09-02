/** Spécialités et domaines — exercice au Cameroun (miroir backend). */

export const MEDECIN_SPECIALITES = [
  'Médecine générale',
  'Médecine familiale',
  'Pédiatrie',
  'Gynécologie-obstétrique',
  'Cardiologie',
  'Chirurgie générale',
  'Chirurgie orthopédique',
  'Dermatologie',
  'Ophtalmologie',
  'ORL',
  'Radiologie',
  'Anesthésie-réanimation',
  'Urologie',
  'Neurologie',
  'Psychiatrie',
  'Médecine interne',
  'Endocrinologie',
  'Gastro-entérologie',
  'Pneumologie',
  'Rhumatologie',
  'Oncologie',
  'Médecine du travail',
  'Médecine d\'urgence',
  'Soins à domicile / perfusion',
  'Autre spécialité',
];

export const INFIRMIER_DOMAINES = [
  'Soins généraux',
  'Urgences',
  'Maternité / néonatologie',
  'Bloc opératoire',
  'Soins à domicile',
  'Perfusions / pansements',
  'Dialyse',
  'Autre domaine',
];

export const AIDE_SOIGNANT_DOMAINES = [
  'Soins à domicile',
  'Perfusions à domicile',
  'Pansements / soins de plaies',
  'Aide aux personnes âgées',
  'Garde malade',
  'Autre domaine',
];

export const SAGE_FEMME_DOMAINES = [
  'Maternité',
  'Consultation prénatale',
  'Accouchement',
  'Planning familial',
  'Autre domaine',
];

export const KINESITHERAPIE_DOMAINES = [
  'Rééducation fonctionnelle',
  'Kinésithérapie respiratoire',
  'Rééducation neurologique',
  'Sport / traumatologie',
  'Autre domaine',
];

export const SPECIALITES_BY_PROFIL = {
  medecin: MEDECIN_SPECIALITES,
  infirmier: INFIRMIER_DOMAINES,
  aide_soignant: AIDE_SOIGNANT_DOMAINES,
  sage_femme: SAGE_FEMME_DOMAINES,
  kinesitherapeute: KINESITHERAPIE_DOMAINES,
};

export const PROFESSION_LABELS = {
  medecin: 'Médecin',
  infirmier: 'Infirmier(ère)',
  aide_soignant: 'Aide-soignant(e)',
  sage_femme: 'Sage-femme',
  kinesitherapeute: 'Kinésithérapeute',
};

export const PROFESSIONS_LIST = Object.keys(PROFESSION_LABELS);
