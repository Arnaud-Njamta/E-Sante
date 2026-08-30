const fichierService = require('../services/fichier.service');

const fichierAccessMiddleware = async (req, res, next) => {
  try {
    const fichier = await fichierService.getFichierMeta(req.params.id);
    if (!fichier) {
      return res.status(404).json({ success: false, message: 'Fichier non trouvé' });
    }

    const allowed = await fichierService.canAccessFichier(req.user, fichier);
    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Accès non autorisé à ce fichier' });
    }

    req.fichier = fichier;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = fichierAccessMiddleware;
