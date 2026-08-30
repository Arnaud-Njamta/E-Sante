const fichierService = require('../services/fichier.service');

const getFichier = async (req, res, next) => {
  try {
    const fichier = await fichierService.getFichierData(req.params.id);
    res.set('Content-Type', fichier.mime_type);
    res.set('Content-Disposition', `inline; filename="${fichier.nom_original}"`);
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(fichier.data);
  } catch (error) {
    next(error);
  }
};

module.exports = { getFichier };
