const { Op } = require('sequelize');
const { Medecin, Etablissement } = require('../models');

const lister = async ({ specialite, recherche, etablissement_id, page = 1, limit = 20 }) => {
  const where = { actif: true };

  if (specialite) where.specialite = { [Op.like]: `%${specialite}%` };
  if (etablissement_id) where.etablissement_id = etablissement_id;
  if (recherche) {
    where[Op.or] = [
      { nom: { [Op.like]: `%${recherche}%` } },
      { prenom: { [Op.like]: `%${recherche}%` } },
      { specialite: { [Op.like]: `%${recherche}%` } },
    ];
  }

  const offset = (page - 1) * limit;

  const { rows, count } = await Medecin.findAndCountAll({
    where,
    include: [
      {
        model: Etablissement,
        as: 'etablissement',
        attributes: ['id', 'nom', 'type', 'ville', 'adresse'],
        required: false,
      },
    ],
    order: [['note_moyenne', 'DESC'], ['nom', 'ASC']],
    limit,
    offset,
  });

  return {
    medecins: rows,
    pagination: { total: count, page, limit, pages: Math.ceil(count / limit) },
  };
};

const getById = async (id) => {
  const medecin = await Medecin.findOne({
    where: { id, actif: true },
    include: [
      {
        model: Etablissement,
        as: 'etablissement',
        attributes: ['id', 'nom', 'type', 'ville', 'adresse', 'telephone'],
      },
    ],
  });

  if (!medecin) {
    const error = new Error('Médecin non trouvé');
    error.statusCode = 404;
    throw error;
  }

  return medecin;
};

module.exports = { lister, getById };
