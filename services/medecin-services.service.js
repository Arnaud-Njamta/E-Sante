const { Op } = require('sequelize');
const { ServiceMedecin } = require('../models');

const formatService = (s) => {
  const data = s.toJSON ? s.toJSON() : s;
  return {
    ...data,
    prix_indicatif: data.prix_indicatif != null ? Number(data.prix_indicatif) : null,
  };
};

const listForMedecin = async (medecinId, { publicOnly = false } = {}) => {
  const where = { medecin_id: medecinId };
  if (publicOnly) where.disponible = true;
  const rows = await ServiceMedecin.findAll({
    where,
    order: [['categorie', 'ASC'], ['nom', 'ASC']],
  });
  return rows.map(formatService);
};

const listByMedecinIds = async (medecinIds, { publicOnly = true } = {}) => {
  if (!medecinIds?.length) return {};
  const where = { medecin_id: { [Op.in]: medecinIds } };
  if (publicOnly) where.disponible = true;
  const rows = await ServiceMedecin.findAll({ where });
  const map = {};
  rows.forEach((row) => {
    const formatted = formatService(row);
    if (!map[formatted.medecin_id]) map[formatted.medecin_id] = [];
    map[formatted.medecin_id].push(formatted);
  });
  return map;
};

const create = async (medecinId, data) => ServiceMedecin.create({
  medecin_id: medecinId,
  nom: data.nom,
  description: data.description,
  categorie: data.categorie || 'Consultation',
  prix_indicatif: data.prix_indicatif,
  duree_minutes: data.duree_minutes,
  disponible: true,
}).then(formatService);

const update = async (medecinId, serviceId, data) => {
  const service = await ServiceMedecin.findOne({
    where: { id: serviceId, medecin_id: medecinId },
  });
  if (!service) {
    const error = new Error('Service non trouvé');
    error.statusCode = 404;
    throw error;
  }
  await service.update(data);
  return formatService(service);
};

const remove = async (medecinId, serviceId) => {
  const service = await ServiceMedecin.findOne({
    where: { id: serviceId, medecin_id: medecinId },
  });
  if (!service) {
    const error = new Error('Service non trouvé');
    error.statusCode = 404;
    throw error;
  }
  service.disponible = false;
  await service.save();
  return { message: 'Service désactivé' };
};

const findMedecinIdsByRecherche = async (recherche) => {
  if (!recherche) return [];
  const rows = await ServiceMedecin.findAll({
    where: {
      disponible: true,
      [Op.or]: [
        { nom: { [Op.like]: `%${recherche}%` } },
        { description: { [Op.like]: `%${recherche}%` } },
        { categorie: { [Op.like]: `%${recherche}%` } },
      ],
    },
    attributes: ['medecin_id'],
  });
  return [...new Set(rows.map((r) => r.medecin_id))];
};

module.exports = {
  listForMedecin,
  listByMedecinIds,
  create,
  update,
  remove,
  findMedecinIdsByRecherche,
};
