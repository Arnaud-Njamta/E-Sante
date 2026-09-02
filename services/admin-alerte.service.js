const { Publication } = require('../models');
const pushService = require('./push-notification.service');
const { saveFichier } = require('./fichier.service');
const { formatPublication } = require('./publication.service');
const { TYPE_FICHIER } = require('../utils/constants');

const { CAMEROON_REGIONS } = require('../config/cameroon-regions');

const creerAlerte = async (adminId, payload, file) => {
  let fichier_image_id = null;
  if (file) {
    const meta = await saveFichier({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      proprietaire_type: 'etablissement',
      proprietaire_id: adminId,
      type_fichier: TYPE_FICHIER.PRODUIT,
    });
    fichier_image_id = meta.id;
  }

  const pub = await Publication.create({
    auteur_type: 'hopital',
    auteur_id: adminId,
    auteur_nom: 'MINSANTE — DjamSanté',
    type: 'alerte_sanitaire',
    titre: payload.titre,
    contenu: payload.contenu,
    fichier_image_id,
    region: payload.region || null,
    priorite: payload.priorite || 'attention',
    expire_at: payload.expire_at || null,
    mis_en_avant: true,
    actif: true,
  });

  let pushResult = { sent: 0 };
  try {
    pushResult = await pushService.broadcastAlerteSanitaire(pub);
  } catch {
    // push optionnel
  }

  return { publication: formatPublication(pub), push: pushResult };
};

const listerAlertes = async () => {
  const rows = await Publication.findAll({
    where: { type: 'alerte_sanitaire', actif: true },
    order: [['createdAt', 'DESC']],
    limit: 50,
  });
  return rows.map((pub) => formatPublication(pub));
};

module.exports = { CAMEROON_REGIONS, creerAlerte, listerAlertes };
