const { Op } = require('sequelize');
const { Etablissement, ServiceEtablissement, Medecin } = require('../models');

const lister = async ({ type, ville, recherche, page = 1, limit = 20 }) => {
  const where = { actif: true };

  if (type) where.type = type;
  if (ville) where.ville = { [Op.like]: `%${ville}%` };
  if (recherche) {
    where[Op.or] = [
      { nom: { [Op.like]: `%${recherche}%` } },
      { description: { [Op.like]: `%${recherche}%` } },
    ];
  }

  const offset = (page - 1) * limit;

  const { rows, count } = await Etablissement.findAndCountAll({
    where,
    include: [
      {
        model: ServiceEtablissement,
        as: 'services',
        where: { disponible: true },
        required: false,
      },
    ],
    order: [['note_moyenne', 'DESC'], ['nom', 'ASC']],
    limit,
    offset,
  });

  return {
    etablissements: rows,
    pagination: { total: count, page, limit, pages: Math.ceil(count / limit) },
  };
};

const getById = async (id) => {
  const etablissement = await Etablissement.findOne({
    where: { id, actif: true },
    include: [
      { model: ServiceEtablissement, as: 'services', where: { disponible: true }, required: false },
      { model: Medecin, as: 'medecins', where: { actif: true }, required: false },
    ],
  });

  if (!etablissement) {
    const error = new Error('Établissement non trouvé');
    error.statusCode = 404;
    throw error;
  }

  return etablissement;
};

const getHoraires = async (id) => {
  const etablissement = await Etablissement.findByPk(id, {
    attributes: ['id', 'nom', 'type', 'horaires_ouverture', 'chat_actif'],
  });

  if (!etablissement) {
    const error = new Error('Établissement non trouvé');
    error.statusCode = 404;
    throw error;
  }

  const horaires = etablissement.horaires_ouverture || {};
  const maintenant = new Date();
  const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const jourActuel = jours[maintenant.getDay()];
  const heureActuelle = `${String(maintenant.getHours()).padStart(2, '0')}:${String(maintenant.getMinutes()).padStart(2, '0')}`;

  let estOuvert = false;
  if (horaires.h24) {
    estOuvert = true;
  } else {
    const horaireJour = horaires[jourActuel];
    if (horaireJour?.ouvert && horaireJour.debut && horaireJour.fin) {
      estOuvert = heureActuelle >= horaireJour.debut && heureActuelle <= horaireJour.fin;
    }
  }

  return {
    etablissement_id: etablissement.id,
    nom: etablissement.nom,
    horaires_ouverture: horaires,
    est_ouvert_maintenant: estOuvert,
    chat_actif: etablissement.chat_actif,
  };
};

module.exports = { lister, getById, getHoraires };
