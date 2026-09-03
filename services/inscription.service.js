const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  InscriptionProfessionnel, Medecin, Etablissement, Patient, Fichier,
} = require('../models');
const {
  USER_ROLES, TYPE_ETABLISSEMENT, STATUT_VALIDATION, SOIGNANT_TYPES, PROFESSION_SANTE_LABELS,
} = require('../utils/constants');
const { saveFichier, mapTypeFichier } = require('./fichier.service');
const { validerCoordonneesPaiement, OPERATEURS_MOBILE_MONEY } = require('../config/paiement');
const { SPECIALITES_BY_PROFIL } = require('../config/cameroon-specialties');
const emailService = require('./email.service');
const adminAudit = require('./admin-audit.service');

const SALT_ROUNDS = 12;

const DOCUMENTS_REQUIS = {
  medecin: ['piece_identite', 'diplome', 'carte_ordre', 'casier_judiciaire'],
  infirmier: ['piece_identite', 'diplome', 'carte_ordre', 'casier_judiciaire'],
  aide_soignant: ['piece_identite', 'diplome', 'casier_judiciaire'],
  sage_femme: ['piece_identite', 'diplome', 'carte_ordre', 'casier_judiciaire'],
  kinesitherapeute: ['piece_identite', 'diplome', 'carte_ordre', 'casier_judiciaire'],
  pharmacie: ['piece_identite', 'agrement', 'autorisation'],
  hopital: ['piece_identite', 'agrement', 'autorisation'],
  clinique: ['piece_identite', 'agrement', 'autorisation'],
};

/** Documents utiles mais non obligatoires à l'inscription */
const DOCUMENTS_OPTIONNELS = {
  pharmacie: ['casier_judiciaire'],
};

const DOC_LABELS = {
  piece_identite: 'Pièce d\'identité (CNI, passeport ou carte de séjour)',
  casier_judiciaire: 'Extrait de casier judiciaire (bulletin n°3) ou attestation',
  diplome: 'Diplôme / attestation de formation',
  carte_ordre: 'Carte d\'ordre / inscription professionnelle (ONMC, ONI…)',
  agrement: 'Agrément officiel de la structure',
  autorisation: 'Autorisation d\'ouverture MINSANTE',
  document: 'Document',
};

const DOC_LABELS_BY_PROFIL = {
  pharmacie: {
    piece_identite: 'Pièce d\'identité du responsable / pharmacien titulaire',
    casier_judiciaire: 'Casier judiciaire du pharmacien titulaire (optionnel)',
    agrement: 'Agrément d\'officine pharmaceutique',
  },
  hopital: {
    piece_identite: 'Pièce d\'identité du représentant légal',
    agrement: 'Agrément / autorisation de l\'établissement',
    autorisation: 'Autorisation d\'exploitation MINSANTE',
  },
  clinique: {
    piece_identite: 'Pièce d\'identité du représentant légal',
    agrement: 'Agrément / autorisation de la clinique',
    autorisation: 'Autorisation d\'exploitation MINSANTE',
  },
};

const NOTES_DOCUMENTS = {
  soignant: 'Pièce d\'identité et casier judiciaire obligatoires pour les professionnels de santé. Diplôme et carte d\'ordre complètent la validation.',
  structure: 'Pièce d\'identité du représentant légal obligatoire. Agrément et autorisation MINSANTE requis pour valider la structure (pas de casier pour une personne morale).',
};

const getLabelsForProfil = (typeProfil) => ({
  ...DOC_LABELS,
  ...(DOC_LABELS_BY_PROFIL[typeProfil] || {}),
});

const ROLE_BY_TYPE = {
  medecin: USER_ROLES.MEDECIN,
  infirmier: USER_ROLES.MEDECIN,
  aide_soignant: USER_ROLES.MEDECIN,
  sage_femme: USER_ROLES.MEDECIN,
  kinesitherapeute: USER_ROLES.MEDECIN,
  pharmacie: USER_ROLES.PHARMACIE,
  hopital: USER_ROLES.HOPITAL,
  clinique: USER_ROLES.CLINIQUE,
};

const isSoignant = (type) => SOIGNANT_TYPES.includes(type);

const generateToken = (id, role) => jwt.sign(
  { id, role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
);

const generateRefreshToken = (id, role) => jwt.sign(
  { id, role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' },
);

const sanitizeInscriptionForAdmin = async (inscription) => {
  const plain = inscription.toJSON ? inscription.toJSON() : { ...inscription };
  if (plain.donnees) {
    const { password_hash_pending, ...safeDonnees } = plain.donnees;
    plain.donnees = safeDonnees;
  }
  if (plain.documents?.length) {
    const ids = plain.documents.map((d) => d.fichier_id).filter(Boolean);
    const fichiers = await Fichier.findAll({
      where: { id: ids },
      attributes: ['id', 'mime_type', 'nom_original'],
    });
    const map = Object.fromEntries(fichiers.map((f) => [f.id, f]));
    plain.documents = plain.documents.map((d) => ({
      ...d,
      mime_type: map[d.fichier_id]?.mime_type || null,
      nom_original: map[d.fichier_id]?.nom_original || null,
    }));
  }
  return plain;
};

/**
 * Compte créé immédiatement (statut_validation = en_attente).
 * Documents optionnels à l'inscription — complétés ensuite pour validation MINSANTE.
 */
const creerInscription = async (payload, files = []) => {
  const { type_profil, email, password, paiement, accept_cgu, ...rest } = payload;

  if (!accept_cgu && accept_cgu !== true && accept_cgu !== 'true') {
    const error = new Error('Vous devez accepter les Conditions Générales d\'Utilisation');
    error.statusCode = 400;
    throw error;
  }

  if (!password || String(password).length < 8) {
    const error = new Error('Mot de passe requis (8 caractères minimum)');
    error.statusCode = 400;
    throw error;
  }

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

  if (!ROLE_BY_TYPE[type_profil]) {
    const error = new Error('Type de profil professionnel invalide');
    error.statusCode = 400;
    throw error;
  }

  if (!files.some((f) => f.fieldname === 'piece_identite')) {
    const error = new Error(
      isSoignant(type_profil)
        ? 'Pièce d\'identité obligatoire à l\'inscription (CNI, passeport ou carte de séjour)'
        : 'Pièce d\'identité du représentant légal obligatoire (CNI, passeport ou carte de séjour)',
    );
    error.statusCode = 400;
    throw error;
  }

  if (isSoignant(type_profil)) {
    const casierOk = rest.declaration_casier_vierge === true
      || rest.declaration_casier_vierge === 'true'
      || files.some((f) => f.fieldname === 'casier_judiciaire');
    if (!casierOk) {
      const error = new Error('Vous devez fournir un casier judiciaire ou certifier sur l\'honneur qu\'il est vierge (case à cocher)');
      error.statusCode = 400;
      throw error;
    }
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  let compte;
  let role;

  if (isSoignant(type_profil)) {
    role = USER_ROLES.MEDECIN;
    compte = await Medecin.create({
      nom: rest.nom,
      prenom: rest.prenom,
      email,
      telephone: rest.telephone,
      specialite: rest.specialite || PROFESSION_SANTE_LABELS[type_profil] || type_profil,
      profession: type_profil,
      numero_ordre: rest.numero_ordre,
      password_hash,
      coordonnees_paiement: coordonneesPaiement,
      statut_validation: STATUT_VALIDATION.EN_ATTENTE,
      actif: true,
    });
  } else {
    const typeMap = {
      pharmacie: TYPE_ETABLISSEMENT.PHARMACIE,
      hopital: TYPE_ETABLISSEMENT.HOPITAL,
      clinique: TYPE_ETABLISSEMENT.CLINIQUE,
    };
    role = ROLE_BY_TYPE[type_profil];
    compte = await Etablissement.create({
      type: typeMap[type_profil],
      nom: rest.nom_structure || rest.nom,
      email,
      telephone: rest.telephone,
      ville: rest.ville,
      region: rest.region,
      numero_agrement: rest.numero_agrement,
      password_hash,
      coordonnees_paiement: coordonneesPaiement,
      modes_paiement: [coordonneesPaiement?.operateur, 'especes'].filter(Boolean),
      statut_validation: STATUT_VALIDATION.EN_ATTENTE,
      chat_actif: false,
      actif: true,
    });
  }

  const docs = [];
  for (const file of files) {
    const fieldName = file.fieldname;
    const meta = await saveFichier({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      proprietaire_type: 'inscription',
      proprietaire_id: compte.id,
      type_fichier: mapTypeFichier(fieldName),
    });
    docs.push({ type: fieldName, fichier_id: meta.id, url: meta.url });
  }

  const requis = DOCUMENTS_REQUIS[type_profil] || [];
  const fournis = docs.map((d) => d.type);
  const manquants = requis.filter((r) => !fournis.includes(r));

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
    compte_cree_id: compte.id,
    donnees: {
      ...rest,
      paiement: coordonneesPaiement,
      accept_cgu: true,
      accept_cgu_at: new Date().toISOString(),
      declaration_casier_vierge: isSoignant(type_profil)
        && !!(rest.declaration_casier_vierge === true || rest.declaration_casier_vierge === 'true'),
      documents_manquants: manquants,
    },
    statut: manquants.length ? 'documents_manquants' : 'en_revision',
    documents: docs,
  });

  await adminAudit.log({
    categorie: adminAudit.CATEGORIES.INSCRIPTION,
    action: adminAudit.ACTIONS.INSCRIPTION_SOUMISE,
    cible_type: 'inscription',
    cible_id: inscription.id,
    details: {
      type_profil,
      email,
      compte_id: compte.id,
      statut: inscription.statut,
      documents_fournis: fournis,
      documents_manquants: manquants,
      compte_cree_immediatement: true,
    },
  }).catch((err) => {
    console.warn('Audit inscription ignoré:', err.message);
  });

  const profile = compte.toJSON();
  delete profile.password_hash;
  profile.role = role;

  setImmediate(() => {
    emailService.sendWelcomeEmail({
      email,
      prenom: rest.prenom || rest.nom_structure || '',
      nom: rest.nom || '',
    }).catch(() => {});
  });

  return {
    id: inscription.id,
    statut: inscription.statut,
    documents_manquants: manquants.map((d) => DOC_LABELS[d] || d),
    compte_id: compte.id,
    role,
    user: profile,
    token: generateToken(compte.id, role),
    refreshToken: generateRefreshToken(compte.id, role),
    validation_pending: true,
    message: manquants.length
      ? 'Compte créé. Connectez-vous puis ajoutez les documents manquants pour la validation MINSANTE.'
      : 'Compte créé. Votre dossier est en cours de vérification — vous pouvez déjà vous connecter.',
  };
};

/** Valide le compte déjà créé (passe statut_validation à valide) */
const validerInscription = async (inscriptionId, { valide_par = 'admin', admin = null, ip = null } = {}) => {
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

  let compteId = inscription.compte_cree_id;

  if (compteId) {
    if (isSoignant(inscription.type_profil)) {
      const medecin = await Medecin.findByPk(compteId);
      if (medecin) {
        medecin.statut_validation = STATUT_VALIDATION.VALIDE;
        medecin.actif = true;
        await medecin.save();
      }
    } else {
      const etab = await Etablissement.findByPk(compteId);
      if (etab) {
        etab.statut_validation = STATUT_VALIDATION.VALIDE;
        etab.actif = true;
        if (inscription.type_profil === 'pharmacie') etab.chat_actif = true;
        await etab.save();
      }
    }
  } else {
    // Ancien flux (compat) : créer le compte à la validation
    const password_hash = inscription.donnees?.password_hash_pending;
    if (!password_hash) {
      const error = new Error('Compte introuvable et mot de passe manquant');
      error.statusCode = 400;
      throw error;
    }
    const paiement = inscription.donnees?.paiement || null;
    if (isSoignant(inscription.type_profil)) {
      const medecin = await Medecin.create({
        nom: inscription.nom,
        prenom: inscription.prenom,
        email: inscription.email,
        telephone: inscription.telephone,
        specialite: inscription.specialite,
        profession: inscription.type_profil,
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
  }

  inscription.statut = 'valide';
  inscription.compte_cree_id = compteId;
  inscription.valide_par = valide_par;
  inscription.date_validation = new Date();
  await inscription.save();

  await adminAudit.log({
    categorie: adminAudit.CATEGORIES.INSCRIPTION,
    action: adminAudit.ACTIONS.INSCRIPTION_VALIDEE,
    acteur: admin,
    cible_type: 'inscription',
    cible_id: inscription.id,
    ip,
    details: {
      type_profil: inscription.type_profil,
      email: inscription.email,
      compte_id: compteId,
      valide_par,
    },
  });

  return { compte_id: compteId, type: inscription.type_profil };
};

const rejeterInscription = async (inscriptionId, motif_rejet, { admin = null, ip = null } = {}) => {
  const inscription = await InscriptionProfessionnel.findByPk(inscriptionId);
  if (!inscription) {
    const error = new Error('Inscription non trouvée');
    error.statusCode = 404;
    throw error;
  }
  inscription.statut = 'rejete';
  inscription.motif_rejet = motif_rejet;
  await inscription.save();

  if (inscription.compte_cree_id) {
    if (isSoignant(inscription.type_profil)) {
      await Medecin.update(
        { statut_validation: STATUT_VALIDATION.REJETE, actif: false },
        { where: { id: inscription.compte_cree_id } },
      );
    } else {
      await Etablissement.update(
        { statut_validation: STATUT_VALIDATION.REJETE, actif: false },
        { where: { id: inscription.compte_cree_id } },
      );
    }
  }

  await adminAudit.log({
    categorie: adminAudit.CATEGORIES.INSCRIPTION,
    action: adminAudit.ACTIONS.INSCRIPTION_REJETEE,
    acteur: admin,
    cible_type: 'inscription',
    cible_id: inscription.id,
    ip,
    details: {
      type_profil: inscription.type_profil,
      email: inscription.email,
      motif_rejet,
    },
  });

  return inscription;
};

const listerEnAttente = async () => {
  const inscriptions = await InscriptionProfessionnel.findAll({
    where: { statut: ['en_attente', 'en_revision', 'documents_manquants'] },
    order: [['createdAt', 'ASC']],
  });
  return Promise.all(inscriptions.map(sanitizeInscriptionForAdmin));
};

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
    compte_cree: !!inscription.compte_cree_id,
  };
};

module.exports = {
  creerInscription,
  validerInscription,
  rejeterInscription,
  listerEnAttente,
  getStatutDemande,
  DOCUMENTS_REQUIS,
  DOCUMENTS_OPTIONNELS,
  DOC_LABELS,
  DOC_LABELS_BY_PROFIL,
  NOTES_DOCUMENTS,
  getLabelsForProfil,
  OPERATEURS_MOBILE_MONEY,
  sanitizeInscriptionForAdmin,
};
