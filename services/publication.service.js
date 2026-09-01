const { Op } = require('sequelize');
const { Publication, PublicationLike, PublicationComment } = require('../models');
const { saveFichier } = require('./fichier.service');
const { TYPE_FICHIER } = require('../utils/constants');

const formatPublication = (pub, userLike = false) => ({
  ...pub.toJSON(),
  image_url: pub.fichier_image_id ? `/api/fichiers/${pub.fichier_image_id}` : null,
  user_a_like: userLike,
  is_alerte: pub.type === 'alerte_sanitaire',
});

const getAuteurInfo = (req) => {
  const role = req.user.role;
  if (role === 'medecin') {
    const m = req.medecin;
    return { auteur_type: 'medecin', auteur_id: m.id, auteur_nom: `Dr. ${m.prenom} ${m.nom}` };
  }
  const etab = req.etablissement || req.pharmacie || req.hopital || req.clinique;
  return { auteur_type: role, auteur_id: etab.id, auteur_nom: etab.nom };
};

const getUserIdentity = (req) => {
  if (!req.user) return null;
  const role = req.user.role;
  if (role === 'patient') {
    const p = req.patient;
    return { type: 'patient', id: p.id, nom: `${p.prenom} ${p.nom}` };
  }
  if (role === 'medecin') {
    const m = req.medecin;
    return { type: 'medecin', id: m.id, nom: `Dr. ${m.prenom} ${m.nom}` };
  }
  const etab = req.etablissement || req.pharmacie || req.hopital || req.clinique;
  return { type: role, id: etab.id, nom: etab.nom };
};

const lister = async ({
  type, auteur_type, page = 1, limit = 20, mis_en_avant, userIdentity, region, alertes_only,
}) => {
  const where = { actif: true };
  if (type) where.type = type;
  if (auteur_type) where.auteur_type = auteur_type;
  if (mis_en_avant) where.mis_en_avant = true;
  if (alertes_only) where.type = 'alerte_sanitaire';

  const andConditions = [];
  if (region) {
    andConditions.push({
      [Op.or]: [{ region: null }, { region: '' }, { region }],
    });
  }
  andConditions.push({
    [Op.or]: [{ expire_at: null }, { expire_at: { [Op.gt]: new Date() } }],
  });
  if (andConditions.length) where[Op.and] = andConditions;

  const offset = (page - 1) * limit;
  const { rows, count } = await Publication.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  let likedIds = new Set();
  if (userIdentity) {
    const likes = await PublicationLike.findAll({
      where: { utilisateur_type: userIdentity.type, utilisateur_id: userIdentity.id },
      attributes: ['publication_id'],
    });
    likedIds = new Set(likes.map((l) => l.publication_id));
  }

  return {
    publications: rows.map((p) => formatPublication(p, likedIds.has(p.id))),
    pagination: { total: count, page, limit },
  };
};

const creer = async (req, payload, file) => {
  const auteur = getAuteurInfo(req);
  let fichier_image_id = null;
  if (file) {
    const meta = await saveFichier({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      proprietaire_type: auteur.auteur_type === 'medecin' ? 'medecin' : 'etablissement',
      proprietaire_id: auteur.auteur_id,
      type_fichier: TYPE_FICHIER.PRODUIT,
    });
    fichier_image_id = meta.id;
  }

  return Publication.create({
    ...auteur,
    type: payload.type || 'actualite',
    titre: payload.titre,
    contenu: payload.contenu,
    fichier_image_id,
    mis_en_avant: payload.mis_en_avant === 'true' || payload.mis_en_avant === true
      || payload.type === 'alerte_sanitaire',
    region: payload.region || null,
    priorite: payload.priorite || (payload.type === 'alerte_sanitaire' ? 'attention' : null),
    expire_at: payload.expire_at || null,
  }).then(async (pub) => {
    if (pub.type === 'alerte_sanitaire') {
      try {
        const pushService = require('./push-notification.service');
        await pushService.broadcastAlerteSanitaire(pub);
      } catch {
        // push optionnel
      }
    }
    return pub;
  });
};

const toggleLike = async (publicationId, userIdentity) => {
  const pub = await Publication.findByPk(publicationId);
  if (!pub) {
    const error = new Error('Publication non trouvée');
    error.statusCode = 404;
    throw error;
  }

  const existing = await PublicationLike.findOne({
    where: {
      publication_id: publicationId,
      utilisateur_type: userIdentity.type,
      utilisateur_id: userIdentity.id,
    },
  });

  if (existing) {
    await existing.destroy();
    pub.likes_count = Math.max(0, pub.likes_count - 1);
    await pub.save();
    return { liked: false, likes_count: pub.likes_count };
  }

  await PublicationLike.create({
    publication_id: publicationId,
    utilisateur_type: userIdentity.type,
    utilisateur_id: userIdentity.id,
  });
  pub.likes_count += 1;
  await pub.save();
  return { liked: true, likes_count: pub.likes_count };
};

const getComments = async (publicationId) => {
  const comments = await PublicationComment.findAll({
    where: { publication_id: publicationId },
    order: [['createdAt', 'ASC']],
    limit: 100,
  });
  return comments;
};

const addComment = async (publicationId, userIdentity, contenu) => {
  const pub = await Publication.findByPk(publicationId);
  if (!pub) {
    const error = new Error('Publication non trouvée');
    error.statusCode = 404;
    throw error;
  }

  const comment = await PublicationComment.create({
    publication_id: publicationId,
    auteur_type: userIdentity.type,
    auteur_id: userIdentity.id,
    auteur_nom: userIdentity.nom,
    contenu,
  });

  pub.comments_count += 1;
  await pub.save();
  return comment;
};

const supprimer = async (publicationId, req) => {
  const pub = await Publication.findByPk(publicationId);
  if (!pub) {
    const error = new Error('Publication non trouvée');
    error.statusCode = 404;
    throw error;
  }
  const auteur = getAuteurInfo(req);
  if (pub.auteur_id !== auteur.auteur_id || pub.auteur_type !== auteur.auteur_type) {
    const error = new Error('Non autorisé');
    error.statusCode = 403;
    throw error;
  }
  pub.actif = false;
  await pub.save();
  return { message: 'Publication supprimée' };
};

const listerAlertes = async (region) => {
  const result = await lister({
    alertes_only: true,
    region: region || null,
    limit: 10,
    mis_en_avant: false,
  });
  return result.publications.sort((a, b) => {
    const prio = { critique: 0, attention: 1, info: 2 };
    return (prio[a.priorite] ?? 3) - (prio[b.priorite] ?? 3);
  });
};

module.exports = {
  lister, creer, toggleLike, getComments, addComment, supprimer, getUserIdentity, formatPublication,
  listerAlertes,
};
