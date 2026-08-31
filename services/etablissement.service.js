const { Op } = require('sequelize');
const { Etablissement, ServiceEtablissement, Medecin, Conversation, Message, ProduitPharmacie, Publication, MedecinAffiliation, MembreEquipeEtablissement } = require('../models');
const { TYPE_ETABLISSEMENT, STATUT_VALIDATION } = require('../utils/constants');
const { parseJsonField } = require('../utils/helpers');
const structureMgmt = require('./structure-management.service');
const { formatMedecin } = require('./medecin.service');
const membreEquipeService = require('./membre-equipe.service');

const lister = async (params = {}) => {
  const listerHelper = require('./etablissement-lister.helper');
  return listerHelper.lister(params);
};

const getById = async (id) => {
  const etablissement = await Etablissement.findOne({
    where: { id, actif: true },
    include: [
      { model: ServiceEtablissement, as: 'services', where: { disponible: true }, required: false },
      { model: Medecin, as: 'medecins', where: { actif: true }, required: false },
      {
        model: ProduitPharmacie,
        as: 'produits',
        where: { actif: true },
        required: false,
      },
    ],
  });

  if (!etablissement) {
    const error = new Error('Établissement non trouvé');
    error.statusCode = 404;
    throw error;
  }

  const data = etablissement.toJSON();
  if (data.fichier_photo_id && !data.image_url) {
    data.image_url = `/api/fichiers/${data.fichier_photo_id}`;
  }
  if (data.produits) {
    data.produits = data.produits.map((p) => ({
      ...p,
      image_url: p.fichier_image_id ? `/api/fichiers/${p.fichier_image_id}` : null,
    }));
  }

  const affiliations = await MedecinAffiliation.findAll({
    where: { etablissement_id: id, statut: 'actif' },
    include: [{
      model: Medecin,
      as: 'medecin',
      where: { actif: true },
      required: true,
      attributes: { exclude: ['password_hash'] },
    }],
  });
  const affiliated = affiliations.map((a) => ({
    ...formatMedecin(a.medecin),
    affiliation_id: a.id,
    affiliation_role: a.role,
  }));
  const legacyIds = new Set((data.medecins || []).map((m) => m.id));
  data.medecins = [
    ...(data.medecins || []).map((m) => formatMedecin(m)),
    ...affiliated.filter((m) => !legacyIds.has(m.id)),
  ];
  data.equipe = await membreEquipeService.listerPublic(id);

  return data;
};

const getHoraires = async (id) => {
  const etablissement = await Etablissement.findByPk(id, {
    attributes: ['id', 'nom', 'type', 'horaires_ouverture', 'chat_actif'],
  });

  if (!etablissement) {
    const error = new Error('Établissement non trouvé');
    error.statusCode = 404;
    throw error;
  }

  const horaires = parseJsonField(etablissement.horaires_ouverture, {});
  const maintenant = new Date();
  const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const jourActuel = jours[maintenant.getDay()];
  const heureActuelle = `${String(maintenant.getHours()).padStart(2, '0')}:${String(maintenant.getMinutes()).padStart(2, '0')}`;

  let estOuvert = false;
  if (horaires.h24) {
    estOuvert = true;
  } else {
    const horaireJour = horaires[jourActuel];
    if (horaireJour?.ouvert && horaireJour.debut && horaireJour.fin) {
      estOuvert = heureActuelle >= horaireJour.debut && heureActuelle <= horaireJour.fin;
    }
  }

  return {
    etablissement_id: etablissement.id,
    nom: etablissement.nom,
    horaires_ouverture: horaires,
    est_ouvert_maintenant: estOuvert,
    chat_actif: etablissement.chat_actif,
  };
};

const getPharmacieDashboard = async (pharmacieId) => {
  const pharmacie = await Etablissement.findOne({
    where: { id: pharmacieId, type: TYPE_ETABLISSEMENT.PHARMACIE, actif: true },
  });

  if (!pharmacie) {
    const error = new Error('Pharmacie non trouvée');
    error.statusCode = 404;
    throw error;
  }

  const conversations = await Conversation.findAll({
    where: { pharmacie_id: pharmacieId },
    include: [{ model: Message, as: 'messages', limit: 1, order: [['createdAt', 'DESC']], separate: true }],
    order: [['dernier_message_at', 'DESC']],
    limit: 10,
  });

  const conversationsOuvertes = await Conversation.count({
    where: { pharmacie_id: pharmacieId, statut: 'ouverte' },
  });

  const conversationsIds = await Conversation.findAll({
    where: { pharmacie_id: pharmacieId },
    attributes: ['id'],
  });

  const messagesNonLus = conversationsIds.length === 0 ? 0 : await Message.count({
    where: {
      conversation_id: { [Op.in]: conversationsIds.map((c) => c.id) },
      expediteur_type: 'patient',
      lu: false,
    },
  });

  return {
    profil: pharmacie,
    stats: {
      note_moyenne: Number(pharmacie.note_moyenne),
      nombre_avis: pharmacie.nombre_avis,
      conversations_ouvertes: conversationsOuvertes,
      messages_non_lus: messagesNonLus,
      chat_actif: pharmacie.chat_actif,
    },
    conversations_recentes: conversations,
    horaires: parseJsonField(pharmacie.horaires_ouverture, {}),
  };
};

const getStructureDashboard = async (etablissementId) => {
  const etab = await Etablissement.findOne({
    where: { id: etablissementId, actif: true },
  });

  if (!etab) {
    const error = new Error('Établissement non trouvé');
    error.statusCode = 404;
    throw error;
  }

  const base = {
    profil: etab,
    stats: {
      note_moyenne: Number(etab.note_moyenne),
      nombre_avis: etab.nombre_avis,
      chat_actif: etab.chat_actif,
    },
    horaires: parseJsonField(etab.horaires_ouverture, {}),
  };

  if (etab.type === TYPE_ETABLISSEMENT.PHARMACIE) {
    const pharmaDash = await getPharmacieDashboard(etablissementId);
    return pharmaDash;
  }

  if ([TYPE_ETABLISSEMENT.HOPITAL, TYPE_ETABLISSEMENT.CLINIQUE].includes(etab.type)) {
    return structureMgmt.enrichStructureDashboard(etab);
  }

  return base;
};

const updateProfil = async (etablissementId, data) => {
  const etab = await Etablissement.findByPk(etablissementId);
  if (!etab) {
    const error = new Error('Établissement non trouvé');
    error.statusCode = 404;
    throw error;
  }
  const allowed = ['nom', 'description', 'adresse', 'ville', 'region', 'telephone', 'chat_actif', 'modes_paiement'];
  allowed.forEach((k) => { if (data[k] !== undefined) etab[k] = data[k]; });
  await etab.save();
  return etab;
};

const updateHoraires = async (etablissementId, horaires) => {
  const etab = await Etablissement.findByPk(etablissementId);
  if (!etab) {
    const error = new Error('Établissement non trouvé');
    error.statusCode = 404;
    throw error;
  }
  etab.horaires_ouverture = horaires;
  await etab.save();
  return etab.horaires_ouverture;
};

const updateLocalisation = async (etablissementId, { latitude, longitude, adresse, ville, region }) => {
  const etab = await Etablissement.findByPk(etablissementId);
  if (!etab) {
    const error = new Error('Établissement non trouvé');
    error.statusCode = 404;
    throw error;
  }
  if (latitude !== undefined) etab.latitude = latitude;
  if (longitude !== undefined) etab.longitude = longitude;
  if (adresse !== undefined) etab.adresse = adresse;
  if (ville !== undefined) etab.ville = ville;
  if (region !== undefined) etab.region = region;
  await etab.save();
  return {
    latitude: etab.latitude,
    longitude: etab.longitude,
    adresse: etab.adresse,
    ville: etab.ville,
    region: etab.region,
  };
};

const uploadPhoto = async (etablissementId, fichierMeta) => {
  const etab = await Etablissement.findByPk(etablissementId);
  etab.fichier_photo_id = fichierMeta.id;
  etab.image_url = fichierMeta.url;
  await etab.save();
  return etab;
};

const getPublications = async (etablissementId) => {
  const etab = await Etablissement.findByPk(etablissementId, { attributes: ['id', 'type'] });
  if (!etab) {
    const error = new Error('Établissement non trouvé');
    error.statusCode = 404;
    throw error;
  }
  return Publication.findAll({
    where: { auteur_id: etablissementId, auteur_type: etab.type, actif: true },
    order: [['createdAt', 'DESC']],
    limit: 6,
  });
};

module.exports = {
  lister, getById, getHoraires, getPharmacieDashboard, getStructureDashboard,
  updateProfil, updateHoraires, updateLocalisation, uploadPhoto, getPublications,
};
