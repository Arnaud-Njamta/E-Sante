const { Op } = require('sequelize');
const { ProduitPharmacie, Fichier, sequelize: db } = require('../models');

const sansAccent = (s) => (s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

const ACCENT_PAIRS = [
  ['é', 'e'], ['è', 'e'], ['ê', 'e'], ['ë', 'e'],
  ['à', 'a'], ['â', 'a'], ['ä', 'a'],
  ['ù', 'u'], ['û', 'u'], ['ü', 'u'],
  ['ô', 'o'], ['ö', 'o'],
  ['î', 'i'], ['ï', 'i'],
  ['ç', 'c'],
];

const sqlSansAccent = (column) => {
  let expr = column;
  ACCENT_PAIRS.forEach(([from, to]) => {
    expr = `REPLACE(${expr}, '${from}', '${to}')`;
  });
  return `LOWER(${expr})`;
};

const buildSearchOr = (recherche) => {
  const term = recherche.trim();
  const plain = sansAccent(term);
  const terms = [...new Set([term, plain].filter(Boolean))];
  const fields = ['nom', 'description', 'categorie'];
  const or = [];
  terms.forEach((t) => {
    fields.forEach((f) => {
      or.push({ [f]: { [Op.like]: `%${t}%` } });
    });
  });
  if (plain) {
    fields.forEach((f) => {
      or.push(db.where(db.literal(sqlSansAccent(`\`ProduitPharmacie\`.\`${f}\``)), { [Op.like]: `%${plain}%` }));
    });
  }
  return or;
};

const mapProduit = (p) => ({
  ...p.toJSON(),
  image_url: p.fichier_image_id ? `/api/fichiers/${p.fichier_image_id}` : null,
  etablissement: p.pharmacie,
});

const etabInclude = (etabWhere = {}) => ({
  association: 'pharmacie',
  attributes: ['id', 'nom', 'type', 'ville', 'adresse', 'telephone', 'latitude', 'longitude'],
  where: { actif: true, ...etabWhere },
  required: true,
});

const listerPublic = async (pharmacieId, { recherche, categorie, page = 1, limit = 50 }) => {
  const where = { pharmacie_id: pharmacieId, actif: true };
  if (categorie) where.categorie = categorie;
  if (recherche) {
    where[Op.or] = [
      { nom: { [Op.like]: `%${recherche}%` } },
      { description: { [Op.like]: `%${recherche}%` } },
    ];
  }

  const offset = (page - 1) * limit;
  const { rows, count } = await ProduitPharmacie.findAndCountAll({
    where,
    order: [['nom', 'ASC']],
    limit,
    offset,
  });

  return {
    produits: rows.map((p) => ({
      ...p.toJSON(),
      image_url: p.fichier_image_id ? `/api/fichiers/${p.fichier_image_id}` : null,
    })),
    pagination: { total: count, page, limit },
  };
};

const listerPharmacie = async (pharmacieId) => {
  const produits = await ProduitPharmacie.findAll({
    where: { pharmacie_id: pharmacieId },
    order: [['nom', 'ASC']],
  });
  return produits.map((p) => ({
    ...p.toJSON(),
    image_url: p.fichier_image_id ? `/api/fichiers/${p.fichier_image_id}` : null,
  }));
};

const creer = async (pharmacieId, data) => ProduitPharmacie.create({ ...data, pharmacie_id: pharmacieId });

const mettreAJour = async (pharmacieId, produitId, data) => {
  const produit = await ProduitPharmacie.findOne({ where: { id: produitId, pharmacie_id: pharmacieId } });
  if (!produit) {
    const error = new Error('Produit non trouvé');
    error.statusCode = 404;
    throw error;
  }
  await produit.update(data);
  return {
    ...produit.toJSON(),
    image_url: produit.fichier_image_id ? `/api/fichiers/${produit.fichier_image_id}` : null,
  };
};

const supprimer = async (pharmacieId, produitId) => {
  const produit = await ProduitPharmacie.findOne({ where: { id: produitId, pharmacie_id: pharmacieId } });
  if (!produit) {
    const error = new Error('Produit non trouvé');
    error.statusCode = 404;
    throw error;
  }
  produit.actif = false;
  await produit.save();
  return { message: 'Produit désactivé' };
};

const rechercherDisponibilite = async ({ recherche, ville, type, type_etablissement }) => {
  const typeEtab = type_etablissement || type;
  const where = { actif: true, stock_disponible: { [Op.gt]: 0 } };

  const etabWhere = {};
  if (ville) etabWhere.ville = { [Op.like]: `%${ville}%` };
  if (typeEtab) etabWhere.type = typeEtab;

  if (recherche && recherche.trim().length >= 1) {
    where[Op.or] = buildSearchOr(recherche);
  }

  const produits = await ProduitPharmacie.findAll({
    where,
    include: [etabInclude(etabWhere)],
    order: [['nom', 'ASC']],
    limit: recherche?.trim() ? 50 : 24,
  });

  return produits.map(mapProduit);
};

module.exports = {
  listerPublic,
  listerPharmacie,
  creer,
  mettreAJour,
  supprimer,
  rechercherDisponibilite,
};
