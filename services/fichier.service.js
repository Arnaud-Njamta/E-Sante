const {
  Fichier, OrdonnanceElectronique, ProduitPharmacie,
} = require('../models');

const { TYPE_FICHIER, USER_ROLES } = require('../utils/constants');



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



const saveFichier = async ({

  buffer,

  originalname,

  mimetype,

  proprietaire_type,

  proprietaire_id,

  type_fichier,

}) => {

  const fichier = await Fichier.create({

    proprietaire_type,

    proprietaire_id,

    type_fichier,

    nom_original: originalname,

    mime_type: mimetype,

    taille: buffer.length,

    data: buffer,

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

  return fichier;

};



const getFichierMeta = async (id) => Fichier.findByPk(id);



const deleteFichier = async (id) => {

  const fichier = await Fichier.findByPk(id);

  if (fichier) await fichier.destroy();

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



const canAccessFichier = async (user, fichier) => {

  if (!user?.id) return false;

  if (user.role === USER_ROLES.ADMIN) return true;



  if (PUBLIC_TYPES.has(fichier.type_fichier)) {

    return true;

  }



  if (fichier.type_fichier === TYPE_FICHIER.CACHET) {

    return canAccessCachet(user, fichier);

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

  getFichierMeta,

  deleteFichier,

  canAccessFichier,

  mapTypeFichier,

};


