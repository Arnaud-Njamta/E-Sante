const { URGENCE_TYPES, CAPACITES_HOPITAL, getProtocole } = require('../config/urgence-types');
const etablissementLister = require('./etablissement-lister.helper');

const listerTypes = () => ({
  types: URGENCE_TYPES,
  capacites: CAPACITES_HOPITAL,
});

const getProtocoleByType = (typeId) => getProtocole(typeId);

const trouverEtablissements = async (params) => {
  const { type_urgence, service_categorie, ...rest } = params;
  const type = URGENCE_TYPES.find((t) => t.id === type_urgence);
  const categories = service_categorie
    ? [service_categorie]
    : (type?.serviceCategories || ['Urgence']);

  const results = await Promise.all(
    categories.map((cat) => etablissementLister.lister({
      ...rest,
      type: rest.type || 'hopital',
      service_categorie: cat,
      limit: rest.limit || 15,
    })),
  );

  const seen = new Set();
  const etablissements = [];
  results.forEach((r, idx) => {
    const cat = categories[idx];
    (r.etablissements || []).forEach((e) => {
      if (seen.has(e.id)) {
        const existing = etablissements.find((x) => x.id === e.id);
        if (existing && !existing.capacites_disponibles.includes(cat)) {
          existing.capacites_disponibles.push(cat);
        }
        return;
      }
      seen.add(e.id);
      etablissements.push({
        ...e,
        capacites_disponibles: [cat],
        services_urgence: (e.services || []).filter(
          (s) => s.disponible && categories.some((c) => s.categorie?.toLowerCase().includes(c.toLowerCase().slice(0, 4))),
        ),
      });
    });
  });

  etablissements.sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999));

  return {
    etablissements,
    type_urgence: type_urgence || null,
    categories_recherchees: categories,
    geo: results[0]?.geo || null,
  };
};

module.exports = {
  listerTypes,
  getProtocoleByType,
  trouverEtablissements,
};
