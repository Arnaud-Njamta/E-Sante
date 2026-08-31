const { Op } = require('sequelize');
const { Etablissement, ServiceEtablissement, Medecin, Conversation, Message, ProduitPharmacie, Publication, MedecinAffiliation, MembreEquipeEtablissement } = require('../models');
const { TYPE_ETABLISSEMENT, STATUT_VALIDATION } = require('../utils/constants');
const { parseJsonField } = require('../utils/helpers');
const structureMgmt = require('./structure-management.service');
const { formatMedecin } = require('./medecin.service');
const membreEquipeService = require('./membre-equipe.service');

const lister = async ({
  type, ville, recherche, page = 1, limit = 20,
  latitude, longitude, radius_km = 25, nearby,
}) => {
  const where = { actif: true, statut_validation: STATUT_VALIDATION.VALIDE };

  if (type) where.type = type;
  if (recherche) {
    where[Op.or] = [
      { nom: { [Op.like]: `%${recherche}%` } },
      { description: { [Op.like]: `%${recherche}%` } },
    ];
  }

  const lat = latitude != null && latitude !== '' ? Number(latitude) : null;
  const lng = longitude != null && longitude !== '' ? Number(longitude) : null;
  const useGeo = Number.isFinite(lat) && Number.isFinite(lng)
    && (nearby === true || nearby === 'true' || nearby === '1'
      || latitude != null);

  if (ville && !useGeo) where.ville = { [Op.like]: `%${ville}%` };

  const offset = (page - 1) * limit;
  const fetchLimit = useGeo ? Math.min(500, Math.max(limit * 10, 100)) : limit;

  const { rows, count } = await Etablissement.findAndCountAll({
    where,
    include: [
      {
        model: ServiceEtablissement,
        as: 'services',
        where: { disponible: true },
        required: false,
      },
    ],
    order: useGeo
      ? [['nom', 'ASC']]
      : [['note_moyenne', 'DESC'], ['nom', 'ASC']],
    limit: fetchLimit,
    offset: useGeo ? 0 : offset,
  });

  const haversineKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2
      + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  let etablissements = rows.map((r) => {
    const plain = r.toJSON ? r.toJSON() : { ...r };
    if (useGeo && plain.latitude != null && plain.longitude != null) {
      plain.distance_km = Math.round(
        haversineKm(lat, lng, Number(plain.latitude), Number(plain.longitude)) * 10,
      ) / 10;
    } else if (useGeo) {
      plain.distance_km = null;
    }
    return plain;
  });

  if (useGeo) {
    const radius = Number(radius_km) || 25;
    etablissements = etablissements
      .filter((e) => e.distance_km != null && e.distance_km <= radius)
      .sort((a, b) => a.distance_km - b.distance_km);

    if (etablissements.length === 0 && ville) {
      const villeWhere = { ...where, ville: { [Op.like]: `%${ville}%` } };
      const villeRows = await Etablissement.findAll({
        where: villeWhere,
        include: [{
          model: ServiceEtablissement,
          as: 'services',
          where: { disponible: true },
          required: false,
        }],
        order: [['note_moyenne', 'DESC'], ['nom', 'ASC']],
        limit,
      });
      etablissements = villeRows.map((r) => r.toJSON ? r.toJSON() : { ...r });
    }

    const total = etablissements.length;
    etablissements = etablissements.slice(offset, offset + limit);
    return {
      etablissements,
      geo: { latitude: lat, longitude: lng, radius_km: radius, ville: ville || null },
      pagination: { total, page, limit, pages: Math.ceil(total / limit) || 1 },
    };
  }

  if (ville && !useGeo) {
    const villeRows = await Etablissement.findAll({
      where: { ...where, ville: { [Op.like]: `%${ville}%` } },
      include: [{
        model: ServiceEtablissement,
        as: 'services',
        where: { disponible: true },
        required: false,
      }],
      order: [['note_moyenne', 'DESC'], ['nom', 'ASC']],
      limit: fetchLimit,
      offset,
    });
    const total = await Etablissement.count({
      where: { ...where, ville: { [Op.like]: `%${ville}%` } },
    });
    return {
      etablissements: villeRows.map((r) => (r.toJSON ? r.toJSON() : { ...r })),
      geo: { ville },
      pagination: { total, page, limit, pages: Math.ceil(total / limit) || 1 },
    };
  }

  return {
    etablissements,
    pagination: { total: count, page, limit, pages: Math.ceil(count / limit) },
  };
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
