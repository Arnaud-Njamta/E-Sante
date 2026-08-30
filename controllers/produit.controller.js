const produitService = require('../services/produit.service');
const { saveFichier } = require('../services/fichier.service');
const { TYPE_FICHIER } = require('../utils/constants');

const getEtab = (req) => req.etablissement || req.pharmacie || req.hopital || req.clinique;

const listerPublic = async (req, res, next) => {
  try {
    const etablissementId = req.params.etablissementId || req.params.pharmacieId;
    const result = await produitService.listerPublic(etablissementId, req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const listerPharmacie = async (req, res, next) => {
  try {
    const etab = getEtab(req);
    const produits = await produitService.listerPharmacie(etab.id);
    res.json({ success: true, data: produits });
  } catch (error) {
    next(error);
  }
};

const creer = async (req, res, next) => {
  try {
    const etab = getEtab(req);
    let fichier_image_id = null;
    if (req.file) {
      const meta = await saveFichier({
        buffer: req.file.buffer,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        proprietaire_type: 'produit',
        proprietaire_id: etab.id,
        type_fichier: TYPE_FICHIER.PRODUIT,
      });
      fichier_image_id = meta.id;
    }
    const data = { ...req.body };
    if (data.prix_fcfa) data.prix_fcfa = parseInt(data.prix_fcfa, 10);
    if (data.stock_disponible) data.stock_disponible = parseInt(data.stock_disponible, 10);
    if (data.necessite_ordonnance) data.necessite_ordonnance = data.necessite_ordonnance === 'true';
    const produit = await produitService.creer(etab.id, { ...data, fichier_image_id });
    res.status(201).json({ success: true, data: produit });
  } catch (error) {
    next(error);
  }
};

const mettreAJour = async (req, res, next) => {
  try {
    const etab = getEtab(req);
    let fichier_image_id;
    if (req.file) {
      const meta = await saveFichier({
        buffer: req.file.buffer,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        proprietaire_type: 'produit',
        proprietaire_id: etab.id,
        type_fichier: TYPE_FICHIER.PRODUIT,
      });
      fichier_image_id = meta.id;
    }
    const data = { ...req.body };
    if (fichier_image_id) data.fichier_image_id = fichier_image_id;
    const produit = await produitService.mettreAJour(etab.id, req.params.id, data);
    res.json({ success: true, data: produit });
  } catch (error) {
    next(error);
  }
};

const supprimer = async (req, res, next) => {
  try {
    const etab = getEtab(req);
    const result = await produitService.supprimer(etab.id, req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
const rechercher = async (req, res, next) => {
  try {
    const produits = await produitService.rechercherDisponibilite(req.query);
    res.json({ success: true, data: produits });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listerPublic, listerPharmacie, creer, mettreAJour, supprimer, rechercher,
};
