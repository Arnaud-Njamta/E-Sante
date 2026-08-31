const { AdminAuditLog } = require('../models');

const ACTIONS = {
  INSCRIPTION_SOUMISE: 'inscription_soumise',
  INSCRIPTION_PATIENT: 'inscription_patient',
  INSCRIPTION_VALIDEE: 'inscription_validee',
  INSCRIPTION_REJETEE: 'inscription_rejetee',
  DOCUMENT_CONSULTE: 'document_consulte',
  CONNEXION: 'connexion',
};

const CATEGORIES = {
  INSCRIPTION: 'inscription',
  DOCUMENT: 'document',
  AUTH: 'auth',
};

const getActeurLabel = (user) => {
  if (!user?.profile) return user?.role || 'system';
  const p = user.profile;
  return p.email || [p.prenom, p.nom].filter(Boolean).join(' ') || p.nom || user.role;
};

const log = async ({
  categorie,
  action,
  acteur = null,
  cible_type = null,
  cible_id = null,
  details = null,
  ip = null,
}) => {
  try {
    await AdminAuditLog.create({
      categorie,
      action,
      acteur_id: acteur?.id || null,
      acteur_label: acteur ? getActeurLabel(acteur) : 'Système',
      cible_type,
      cible_id,
      details,
      ip,
    });
  } catch (err) {
    console.warn('AdminAuditLog:', err.message);
  }
};

const formatLog = (log) => {
  const plain = log.toJSON ? log.toJSON() : log;
  return {
    id: plain.id,
    categorie: plain.categorie,
    action: plain.action,
    acteur_id: plain.acteur_id,
    acteur_label: plain.acteur_label,
    cible_type: plain.cible_type,
    cible_id: plain.cible_id,
    details: plain.details,
    ip: plain.ip,
    created_at: plain.created_at || plain.createdAt,
  };
};

const lister = async ({
  categorie,
  cible_type,
  cible_id,
  limit = 100,
  offset = 0,
} = {}) => {
  const where = {};
  if (categorie) where.categorie = categorie;
  if (cible_type) where.cible_type = cible_type;
  if (cible_id) where.cible_id = cible_id;

  const cap = Math.min(parseInt(limit, 10) || 100, 500);
  const skip = Math.max(parseInt(offset, 10) || 0, 0);

  try {
    const [total, rows] = await Promise.all([
      AdminAuditLog.count({ where }),
      AdminAuditLog.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: cap,
        offset: skip,
      }),
    ]);

    return { logs: rows.map(formatLog), total };
  } catch (err) {
    console.warn('[admin-audit] lister:', err.message);
    return { logs: [], total: 0 };
  }
};

module.exports = {
  ACTIONS,
  CATEGORIES,
  log,
  lister,
  getActeurLabel,
};
