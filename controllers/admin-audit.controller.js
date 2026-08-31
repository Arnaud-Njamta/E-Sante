const adminAuditService = require('../services/admin-audit.service');

const lister = async (req, res, next) => {
  try {
    const { categorie, cible_type, cible_id, limit, offset } = req.query;
    const result = await adminAuditService.lister({
      categorie,
      cible_type,
      cible_id,
      limit,
      offset,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[admin/audit-logs]', error.message);
    next(error);
  }
};

module.exports = { lister };
