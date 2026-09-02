const { Op } = require('sequelize');
const { Etablissement, ServiceEtablissement } = require('../models');
const { STATUT_VALIDATION } = require('../utils/constants');
const { haversineKm, parseGeoParams } = require('../utils/geo');

const serviceInclude = {
  model: ServiceEtablissement,
  as: 'services',
  where: { disponible: true },
  required: false,
};

const fetchRows = async (where, order, limit, offset = 0, serviceCategorie = null) => {
  const cap = Math.max(1, Math.min(parseInt(limit, 10) || 20, 500));
  const skip = Math.max(parseInt(offset, 10) || 0, 0);

  if (serviceCategorie) {
    return Etablissement.findAll({
      where,
      include: [{
        model: ServiceEtablissement,
        as: 'services',
        where: { disponible: true, categorie: { [Op.like]: `%${serviceCategorie}%` } },
        required: true,
      }],
      order,
      limit: cap,
      offset: skip,
      subQuery: false,
    });
  }

  return Etablissement.findAll({
    where,
    include: [{ ...serviceInclude, separate: true }],
    order,
    limit: cap,
    offset: skip,
    subQuery: false,
  });
};

const buildWhere = ({ type, recherche, ville, useGeo, de_garde }) => {
  const where = { actif: true, statut_validation: STATUT_VALIDATION.VALIDE };
  if (type) where.type = type;
  if (de_garde === true || de_garde === 'true' || de_garde === '1') {
    where.de_garde = true;
  }
  if (recherche) {
    where[Op.or] = [
      { nom: { [Op.like]: `%${recherche}%` } },
      { description: { [Op.like]: `%${recherche}%` } },
    ];
  }
  if (ville && !useGeo) {
    where.ville = { [Op.like]: `%${ville}%` };
  }
  return where;
};

const lister = async ({
  type, ville, recherche, page = 1, limit = 20,
  latitude, longitude, radius_km = 25, nearby, service_categorie, de_garde,
} = {}) => {
  try {
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
    const offset = (pageNum - 1) * limitNum;

    const { lat, lng, useGeo, radius } = parseGeoParams({ latitude, longitude, nearby, radius_km });

    const where = buildWhere({ type, recherche, ville, useGeo, de_garde });
    const defaultOrder = [['de_garde', 'DESC'], ['note_moyenne', 'DESC'], ['nom', 'ASC']];

    if (!useGeo) {
      const [rows, total] = await Promise.all([
        fetchRows(where, defaultOrder, limitNum, offset, service_categorie),
        service_categorie
          ? Etablissement.count({
            where,
            include: [{
              model: ServiceEtablissement,
              as: 'services',
              where: { disponible: true, categorie: { [Op.like]: `%${service_categorie}%` } },
              required: true,
            }],
            distinct: true,
          })
          : Etablissement.count({ where }),
      ]);
      return {
        etablissements: rows.map((r) => (r.toJSON ? r.toJSON() : r)),
        geo: ville ? { ville } : null,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum) || 1,
        },
      };
    }

    const radiusKm = radius;
    const rows = await fetchRows(where, defaultOrder, 150, 0, service_categorie);

    let etablissements = rows.map((r) => {
      const plain = r.toJSON ? r.toJSON() : { ...r };
      if (plain.latitude != null && plain.longitude != null) {
        plain.distance_km = Math.round(
          haversineKm(lat, lng, Number(plain.latitude), Number(plain.longitude)) * 10,
        ) / 10;
      }
      return plain;
    });

    etablissements = etablissements
      .filter((e) => e.distance_km != null && e.distance_km <= radiusKm)
      .sort((a, b) => {
        if (a.de_garde !== b.de_garde) return b.de_garde - a.de_garde;
        return a.distance_km - b.distance_km;
      });

    if (etablissements.length === 0 && ville) {
      const villeWhere = buildWhere({ type, recherche, ville, useGeo: false });
      const villeRows = await fetchRows(villeWhere, defaultOrder, limitNum, 0);
      etablissements = villeRows.map((r) => (r.toJSON ? r.toJSON() : r));
    }

    if (etablissements.length === 0) {
      const fallbackRows = await fetchRows(where, defaultOrder, limitNum, 0);
      etablissements = fallbackRows.map((r) => (r.toJSON ? r.toJSON() : r));
    }

    const total = etablissements.length;
    etablissements = etablissements.slice(offset, offset + limitNum);

    return {
      etablissements,
      geo: { latitude: lat, longitude: lng, radius_km: radiusKm, ville: ville || null },
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1,
      },
    };
  } catch (err) {
    console.error('[etablissements/lister]', err.message);
    return {
      etablissements: [],
      pagination: { total: 0, page: 1, limit: 20, pages: 0 },
      error: err.message,
    };
  }
};

module.exports = { lister };
