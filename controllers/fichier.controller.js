const fichierService = require('../services/fichier.service');
const adminAudit = require('../services/admin-audit.service');
const { USER_ROLES } = require('../utils/constants');

const getFichier = async (req, res, next) => {
  try {
    const fichier = await fichierService.getFichierData(req.params.id);

    if (
      req.user?.role === USER_ROLES.ADMIN
      && req.fichier?.proprietaire_type === 'inscription'
    ) {
      await adminAudit.log({
        categorie: adminAudit.CATEGORIES.DOCUMENT,
        action: adminAudit.ACTIONS.DOCUMENT_CONSULTE,
        acteur: req.user,
        cible_type: 'inscription',
        cible_id: req.fichier.proprietaire_id,
        ip: req.ip,
        details: {
          fichier_id: req.params.id,
          type_fichier: req.fichier.type_fichier,
          nom_original: req.fichier.nom_original,
        },
      });
    }

    res.set('Content-Type', fichier.mime_type);
    res.set('Content-Disposition', `inline; filename="${fichier.nom_original}"`);
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(fichier.data);
  } catch (error) {
    next(error);
  }
};

module.exports = { getFichier };
