const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const { v4: uuidv4 } = require('uuid');
const {
  Fichier, OrdonnanceElectronique, ProduitPharmacie,
} = require('../models');
const { TYPE_FICHIER, USER_ROLES } = require('../utils/constants');

const UPLOAD_ROOT = path.resolve(process.env.UPLOAD_DIR || './uploads');
const FICHIERS_SUBDIR = 'fichiers';

const PUBLIC_TYPES = new Set([
  TYPE_FICHIER.PHOTO_PROFIL,
  TYPE_FICHIER.PRODUIT,
  TYPE_FICHIER.DOCUMENT,
]);

const SENSITIVE_TYPES = new Set([
  TYPE_FICHIER.DIPLOME,
  TYPE_FICHIER.CARTE_ORDRE,
  TYPE_FICHIER.AGREMENT,
  TYPE_FICHIER.AUTORISATION,
]);

const MIME_EXT = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};

const ensureStorageDirs = () => {
  const dir = path.join(UPLOAD_ROOT, FICHIERS_SUBDIR);
  if (!fsSync.existsSync(dir)) {
    fsSync.mkdirSync(dir, { recursive: true });
  }
};

const extFromMime = (mimetype, originalname) => {
  if (MIME_EXT[mimetype]) return MIME_EXT[mimetype];
  const ext = path.extname(originalname || '').toLowerCase();
  return ext || '.bin';
};

const resolveAbsolutePath = (cheminDisque) => {
  if (!cheminDisque) return null;
  const normalized = cheminDisque.replace(/\\/g, '/');
  if (normalized.includes('..')) return null;
  return path.join(UPLOAD_ROOT, normalized);
};

/** Enregistre le fichier sur disque ; MySQL = métadonnées uniquement (pas de BLOB). */
const saveFichier = async ({
  buffer,
  originalname,
  mimetype,
  proprietaire_type,
  proprietaire_id,
  type_fichier,
}) => {
  ensureStorageDirs();

  const fileId = uuidv4();
  const ext = extFromMime(mimetype, originalname);
  const relativePath = `${FICHIERS_SUBDIR}/${fileId}${ext}`;
  const absolutePath = path.join(UPLOAD_ROOT, relativePath);

  await fs.writeFile(absolutePath, buffer);

  const fichier = await Fichier.create({
    id: fileId,
    proprietaire_type,
    proprietaire_id,
    type_fichier,
    nom_original: originalname,
    mime_type: mimetype,
    taille: buffer.length,
    chemin_disque: relativePath,
    data: null,
  });

  return {
    id: fichier.id,
    nom_original: fichier.nom_original,
    mime_type: fichier.mime_type,
    taille: fichier.taille,
    type_fichier: fichier.type_fichier,
    url: `/api/fichiers/${fichier.id}`,
  };
};

const getFichierData = async (id) => {
  const fichier = await Fichier.scope('withData').findByPk(id);
  if (!fichier) {
    const error = new Error('Fichier non trouvé');
    error.statusCode = 404;
    throw error;
  }

  const abs = resolveAbsolutePath(fichier.chemin_disque);
  if (abs && fsSync.existsSync(abs)) {
    fichier.data = await fs.readFile(abs);
    return fichier;
  }

  if (fichier.data) {
    return fichier;
  }

  const error = new Error('Fichier non trouvé sur le disque');
  error.statusCode = 404;
  throw error;
};

/** Chemin absolu pour envoi direct (sendFile) — plus efficace que charger en RAM. */
const getFichierAbsolutePath = async (id) => {
  const fichier = await Fichier.findByPk(id);
  if (!fichier) return null;
  const abs = resolveAbsolutePath(fichier.chemin_disque);
  if (abs && fsSync.existsSync(abs)) return abs;
  return null;
};

const getFichierMeta = async (id) => Fichier.findByPk(id);

const deleteFichier = async (id) => {
  const fichier = await Fichier.findByPk(id);
  if (!fichier) return;

  const abs = resolveAbsolutePath(fichier.chemin_disque);
  if (abs && fsSync.existsSync(abs)) {
    await fs.unlink(abs).catch(() => {});
  }
  await fichier.destroy();
};

const isOwner = (user, fichier) => {
  if (!user?.id) return false;
  const role = user.role;
  if (role === USER_ROLES.ADMIN) return true;

  const ownerMap = {
    patient: USER_ROLES.PATIENT,
    medecin: USER_ROLES.MEDECIN,
    etablissement: [USER_ROLES.PHARMACIE, USER_ROLES.HOPITAL, USER_ROLES.CLINIQUE],
    inscription: USER_ROLES.ADMIN,
  };

  const expected = ownerMap[fichier.proprietaire_type];
  if (!expected) return false;
  if (Array.isArray(expected)) {
    return expected.includes(role) && user.id === fichier.proprietaire_id;
  }
  return role === expected && user.id === fichier.proprietaire_id;
};

const canAccessCachet = async (user, fichier) => {
  if (isOwner(user, fichier)) return true;
  if (!user?.id) return false;

  const ord = await OrdonnanceElectronique.findOne({
    where: { fichier_cachet_id: fichier.id },
    attributes: ['patient_id', 'medecin_id', 'statut'],
  });
  if (!ord) return false;

  if (user.role === USER_ROLES.PATIENT && ord.patient_id === user.id) return true;
  if (user.role === USER_ROLES.MEDECIN && ord.medecin_id === user.id) return true;
  if ([USER_ROLES.PHARMACIE, USER_ROLES.HOPITAL, USER_ROLES.CLINIQUE].includes(user.role)
    && ord.statut === 'signee') {
    return true;
  }
  return false;
};

const canAccessSignature = async (user, fichier) => {
  if (isOwner(user, fichier)) return true;
  if (!user?.id) return false;

  const ord = await OrdonnanceElectronique.findOne({
    where: { fichier_signature_id: fichier.id },
    attributes: ['patient_id', 'medecin_id', 'statut'],
  });
  if (!ord) return false;

  if (user.role === USER_ROLES.PATIENT && ord.patient_id === user.id) return true;
  if (user.role === USER_ROLES.MEDECIN && ord.medecin_id === user.id) return true;
  if ([USER_ROLES.PHARMACIE, USER_ROLES.HOPITAL, USER_ROLES.CLINIQUE].includes(user.role)
    && ['signee', 'delivree'].includes(ord.statut)) {
    return true;
  }
  return false;
};

const canAccessFichier = async (user, fichier) => {
  if (PUBLIC_TYPES.has(fichier.type_fichier)) {
    return true;
  }

  if (!user?.id) return false;

  if (user.role === USER_ROLES.ADMIN) return true;

  if (fichier.type_fichier === TYPE_FICHIER.CACHET) {
    return canAccessCachet(user, fichier);
  }

  if (fichier.type_fichier === TYPE_FICHIER.SIGNATURE) {
    return canAccessSignature(user, fichier);
  }

  if (SENSITIVE_TYPES.has(fichier.type_fichier)) {
    return isOwner(user, fichier);
  }

  if (fichier.type_fichier === TYPE_FICHIER.ORDONNANCE_PDF) {
    return canAccessCachet(user, fichier);
  }

  if (fichier.proprietaire_type === 'produit') {
    const produit = await ProduitPharmacie.findByPk(fichier.proprietaire_id);
    if (produit) return true;
  }

  if (fichier.proprietaire_type === 'etablissement' || fichier.proprietaire_type === 'medecin') {
    return isOwner(user, fichier) || PUBLIC_TYPES.has(fichier.type_fichier);
  }

  return isOwner(user, fichier);
};

const mapTypeFichier = (fieldName) => {
  const map = {
    photo: TYPE_FICHIER.PHOTO_PROFIL,
    cachet: TYPE_FICHIER.CACHET,
    signature: TYPE_FICHIER.SIGNATURE,
    diplome: TYPE_FICHIER.DIPLOME,
    carte_ordre: TYPE_FICHIER.CARTE_ORDRE,
    agrement: TYPE_FICHIER.AGREMENT,
    autorisation: TYPE_FICHIER.AUTORISATION,
    produit: TYPE_FICHIER.PRODUIT,
    document: TYPE_FICHIER.DOCUMENT,
  };
  return map[fieldName] || TYPE_FICHIER.DOCUMENT;
};

module.exports = {
  saveFichier,
  getFichierData,
  getFichierAbsolutePath,
  getFichierMeta,
  deleteFichier,
  canAccessFichier,
  mapTypeFichier,
  ensureStorageDirs,
  UPLOAD_ROOT,
};
