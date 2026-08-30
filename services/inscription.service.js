const bcrypt = require('bcrypt');
const {
  InscriptionProfessionnel, Medecin, Etablissement, Patient,
} = require('../models');
const {
  USER_ROLES, TYPE_ETABLISSEMENT, STATUT_VALIDATION,
} = require('../utils/constants');
const { saveFichier, mapTypeFichier } = require('./fichier.service');
const { validerCoordonneesPaiement, OPERATEURS_MOBILE_MONEY } = require('../config/paiement');

const SALT_ROUNDS = 12;

const DOCUMENTS_REQUIS = {
  medecin: ['diplome', 'carte_ordre'],
  pharmacie: ['agrement', 'autorisation'],
  hopital: ['agrement', 'autorisation'],
  clinique: ['agrement', 'autorisation'],
};

const creerInscription = async (payload, files = []) => {
  const { type_profil, email, password, paiement, ...rest } = payload;

  const coordonneesPaiement = validerCoordonneesPaiement(paiement || {
    operateur: rest.operateur_mobile,
    numero: rest.numero_mobile_money,
    titulaire: rest.titulaire_compte,
    numero_marchand: rest.numero_marchand,
  });

  const existPatient = await Patient.findOne({ where: { email } });
  const existMedecin = await Medecin.findOne({ where: { email } });
  const existEtab = await Etablissement.findOne({ where: { email } });
  const existInscription = await InscriptionProfessionnel.findOne({
    where: { email, statut: ['en_attente', 'en_revision', 'documents_manquants'] },
  });

  if (existPatient || existMedecin || existEtab || existInscription) {
    const error = new Error('Un compte ou une demande existe déjà avec cet email');
    error.statusCode = 409;
    throw error;
  }

  const inscription = await InscriptionProfessionnel.create({
    type_profil,
    email,
    nom: rest.nom,
    prenom: rest.prenom,
    nom_structure: rest.nom_structure,
    telephone: rest.telephone,
    ville: rest.ville,
    region: rest.region,
    numero_ordre: rest.numero_ordre,
    numero_agrement: rest.numero_agrement,
    specialite: rest.specialite,
    donnees: {
      ...rest,
      paiement: coordonneesPaiement,
      password_hash_pending: await bcrypt.hash(password, SALT_ROUNDS),
    },
    statut: 'en_attente',
    documents: [],
  });

  const docs = [];
  for (const file of files) {
    const fieldName = file.fieldname;
    const meta = await saveFichier({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      proprietaire_type: 'inscription',
      proprietaire_id: inscription.id,
      type_fichier: mapTypeFichier(fieldName),
    });
    docs.push({ type: fieldName, fichier_id: meta.id, url: meta.url });
  }

  const requis = DOCUMENTS_REQUIS[type_profil] || [];
  const fournis = docs.map((d) => d.type);
  const manquants = requis.filter((r) => !fournis.includes(r));

  inscription.documents = docs;
  inscription.statut = manquants.length ? 'documents_manquants' : 'en_revision';
  inscription.donnees = {
    ...inscription.donnees,
    documents_manquants: manquants,
  };
  await inscription.save();

  return {
    id: inscription.id,
    statut: inscription.statut,
    documents_manquants: manquants,
    message: manquants.length
      ? 'Demande enregistrée — documents manquants à compléter'
      : 'Demande enregistrée — en cours de validation par notre équipe',
  };
};

const validerInscription = async (inscriptionId, { valide_par = 'admin' } = {}) => {
  const inscription = await InscriptionProfessionnel.findByPk(inscriptionId);
  if (!inscription) {
    const error = new Error('Inscription non trouvée');
    error.statusCode = 404;
    throw error;
  }
  if (inscription.statut === 'valide') {
    const error = new Error('Déjà validée');
    error.statusCode = 400;
    throw error;
  }

  const password_hash = inscription.donnees?.password_hash_pending;
  if (!password_hash) {
    const error = new Error('Mot de passe manquant dans la demande');
    error.statusCode = 400;
    throw error;
  }

  let compteId;
  const paiement = inscription.donnees?.paiement || null;

  if (inscription.type_profil === 'medecin') {
    const medecin = await Medecin.create({
      nom: inscription.nom,
      prenom: inscription.prenom,
      email: inscription.email,
      telephone: inscription.telephone,
      specialite: inscription.specialite,
      numero_ordre: inscription.numero_ordre,
      password_hash,
      coordonnees_paiement: paiement,
      statut_validation: STATUT_VALIDATION.VALIDE,
      actif: true,
    });
    compteId = medecin.id;
  } else {
    const typeMap = {
      pharmacie: TYPE_ETABLISSEMENT.PHARMACIE,
      hopital: TYPE_ETABLISSEMENT.HOPITAL,
      clinique: TYPE_ETABLISSEMENT.CLINIQUE,
    };
    const etab = await Etablissement.create({
      type: typeMap[inscription.type_profil],
      nom: inscription.nom_structure || inscription.nom,
      email: inscription.email,
      telephone: inscription.telephone,
      ville: inscription.ville,
      region: inscription.region,
      numero_agrement: inscription.numero_agrement,
      password_hash,
      coordonnees_paiement: paiement,
      modes_paiement: [paiement?.operateur, 'especes'].filter(Boolean),
      statut_validation: STATUT_VALIDATION.VALIDE,
      chat_actif: inscription.type_profil === 'pharmacie',
      actif: true,
    });
    compteId = etab.id;
  }

  inscription.statut = 'valide';
  inscription.compte_cree_id = compteId;
  inscription.valide_par = valide_par;
  inscription.date_validation = new Date();
  await inscription.save();

  return { compte_id: compteId, type: inscription.type_profil };
};

const rejeterInscription = async (inscriptionId, motif_rejet) => {
  const inscription = await InscriptionProfessionnel.findByPk(inscriptionId);
  if (!inscription) {
    const error = new Error('Inscription non trouvée');
    error.statusCode = 404;
    throw error;
  }
  inscription.statut = 'rejete';
  inscription.motif_rejet = motif_rejet;
  await inscription.save();
  return inscription;
};

const listerEnAttente = async () => InscriptionProfessionnel.findAll({
  where: { statut: ['en_attente', 'en_revision', 'documents_manquants'] },
  order: [['createdAt', 'ASC']],
});

const getStatutDemande = async (email, reference) => {
  const inscription = await InscriptionProfessionnel.findOne({
    where: { email, id: reference },
    order: [['createdAt', 'DESC']],
  });

  if (!inscription) {
    return {
      message: 'Aucune demande trouvée avec ces informations. Vérifiez l\'email et la référence reçue à l\'inscription.',
      trouvee: false,
    };
  }

  return {
    trouvee: true,
    statut: inscription.statut,
    motif_rejet: inscription.motif_rejet,
    documents_manquants: inscription.donnees?.documents_manquants || [],
    date_validation: inscription.date_validation,
  };
};

module.exports = {
  creerInscription,
  validerInscription,
  rejeterInscription,
  listerEnAttente,
  getStatutDemande,
  DOCUMENTS_REQUIS,
  OPERATEURS_MOBILE_MONEY,
};
