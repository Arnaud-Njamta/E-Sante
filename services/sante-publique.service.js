const { Op, fn, col } = require('sequelize');
const {
  Patient, Etablissement, Publication, ProfilFamille, DemandePriseEnCharge,
} = require('../models');
const { CAMEROON_REGIONS } = require('../config/cameroon-regions');

const getSantePublique = async () => {
  const now = new Date();

  const alertesActives = await Publication.findAll({
    where: {
      type: 'alerte_sanitaire',
      actif: true,
      [Op.or]: [{ expire_at: null }, { expire_at: { [Op.gt]: now } }],
    },
    order: [['createdAt', 'DESC']],
    limit: 20,
  });

  const alertesParRegion = CAMEROON_REGIONS.map((region) => {
    const regionales = alertesActives.filter((a) => a.region === region);
    const nationales = alertesActives.filter((a) => !a.region);
    return {
      region,
      count: regionales.length + (nationales.length > 0 ? 1 : 0),
      alertes: [...regionales, ...nationales.slice(0, 1)].map((a) => ({
        id: a.id,
        titre: a.titre,
        priorite: a.priorite,
        created_at: a.createdAt,
      })),
    };
  });

  const patientsParRegion = await Patient.findAll({
    attributes: ['region', [fn('COUNT', col('id')), 'count']],
    where: { region: { [Op.ne]: null } },
    group: ['region'],
    raw: true,
  });

  const etabsParRegion = await Etablissement.findAll({
    attributes: ['region', [fn('COUNT', col('id')), 'count']],
    where: { actif: true, region: { [Op.ne]: null } },
    group: ['region'],
    raw: true,
  });

  const [patientsTotal, profilsFamille, demandesUrgence, etablissementsTotal] = await Promise.all([
    Patient.count(),
    ProfilFamille.count({ where: { actif: true } }),
    DemandePriseEnCharge.count({ where: { statut: 'en_attente', priorite: 'urgent' } }),
    Etablissement.count({ where: { actif: true } }),
  ]);

  return {
    resume: {
      patients_total: patientsTotal,
      profils_famille: profilsFamille,
      etablissements_total: etablissementsTotal,
      alertes_actives: alertesActives.length,
      demandes_urgence_en_attente: demandesUrgence,
    },
    alertes_actives: alertesActives.map((a) => ({
      id: a.id,
      titre: a.titre,
      contenu: a.contenu,
      region: a.region,
      priorite: a.priorite,
      auteur_nom: a.auteur_nom,
      created_at: a.createdAt,
      expire_at: a.expire_at,
    })),
    carte_regions: alertesParRegion,
    repartition: {
      patients: patientsParRegion.map((r) => ({
        region: r.region,
        count: parseInt(r.count, 10),
      })),
      etablissements: etabsParRegion.map((r) => ({
        region: r.region,
        count: parseInt(r.count, 10),
      })),
    },
    fetched_at: new Date().toISOString(),
  };
};

module.exports = { getSantePublique, CAMEROON_REGIONS };
