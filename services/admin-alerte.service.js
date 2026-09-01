const { Publication } = require('../models');
const pushService = require('./push-notification.service');

const { CAMEROON_REGIONS } = require('../config/cameroon-regions');

const creerAlerte = async (adminId, payload) => {
  const pub = await Publication.create({
    auteur_type: 'hopital',
    auteur_id: adminId,
    auteur_nom: 'MINSANTE — DjamSanté',
    type: 'alerte_sanitaire',
    titre: payload.titre,
    contenu: payload.contenu,
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

  return { publication: pub, push: pushResult };
};

const listerAlertes = async () => {
  const rows = await Publication.findAll({
    where: { type: 'alerte_sanitaire', actif: true },
    order: [['createdAt', 'DESC']],
    limit: 50,
  });
  return rows;
};

module.exports = { CAMEROON_REGIONS, creerAlerte, listerAlertes };
