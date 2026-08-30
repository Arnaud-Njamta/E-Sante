const { OrdonnanceAuditLog } = require('../models');

const log = async (ordonnanceId, action, acteurType, acteurId, details = null) => {
  await OrdonnanceAuditLog.create({
    ordonnance_id: ordonnanceId,
    action,
    acteur_type: acteurType,
    acteur_id: acteurId,
    details,
  });
};

const lister = async (ordonnanceId) => OrdonnanceAuditLog.findAll({
  where: { ordonnance_id: ordonnanceId },
  order: [['createdAt', 'ASC']],
});

module.exports = { log, lister };
