const path = require('path');
const fichierService = require('../services/fichier.service');
const adminAudit = require('../services/admin-audit.service');
const { USER_ROLES } = require('../utils/constants');

const getFichier = async (req, res, next) => {
  try {
    const fichierMeta = req.fichier || await fichierService.getFichierMeta(req.params.id);
    const absPath = await fichierService.getFichierAbsolutePath(req.params.id);

    if (
      req.user?.role === USER_ROLES.ADMIN
      && fichierMeta?.proprietaire_type === 'inscription'
    ) {
      await adminAudit.log({
        categorie: adminAudit.CATEGORIES.DOCUMENT,
        action: adminAudit.ACTIONS.DOCUMENT_CONSULTE,
        acteur: req.user,
        cible_type: 'inscription',
        cible_id: fichierMeta.proprietaire_id,
        ip: req.ip,
        details: {
          fichier_id: req.params.id,
          type_fichier: fichierMeta.type_fichier,
          nom_original: fichierMeta.nom_original,
        },
      });
    }

    res.set('Content-Type', fichierMeta.mime_type);
    res.set('Content-Disposition', `inline; filename="${fichierMeta.nom_original}"`);
    res.set('Cache-Control', 'public, max-age=86400');

    if (absPath) {
      return res.sendFile(path.resolve(absPath));
    }

    const fichier = await fichierService.getFichierData(req.params.id);
    return res.send(fichier.data);
  } catch (error) {
    next(error);
  }
};

module.exports = { getFichier };
