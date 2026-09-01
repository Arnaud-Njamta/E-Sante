const { ConsentementPatient } = require('../models');
const { Op } = require('sequelize');
const { RendezVous } = require('../models');
const {
  CONSENTEMENT_TYPES,
  POLITIQUE_CONFIDENTIALITE_VERSION,
  STATUT_RDV,
} = require('../utils/constants');

const enregistrer = async ({
  patient_id,
  type,
  medecin_id = null,
  rendez_vous_id = null,
  politique_version = POLITIQUE_CONFIDENTIALITE_VERSION,
  ip = null,
  user_agent = null,
}) => {
  return ConsentementPatient.create({
    patient_id,
    type,
    medecin_id,
    rendez_vous_id,
    politique_version,
    accepte: true,
    ip,
    user_agent,
  });
};

const enregistrerLot = async (items) => Promise.all(items.map((item) => enregistrer(item)));

const aConsentementActif = async ({
  patient_id,
  type,
  medecin_id = null,
  rendez_vous_id = null,
}) => {
  const where = {
    patient_id,
    type,
    accepte: true,
    revoked_at: null,
  };
  if (medecin_id) where.medecin_id = medecin_id;
  if (rendez_vous_id) where.rendez_vous_id = rendez_vous_id;

  const row = await ConsentementPatient.findOne({
    where,
    order: [['created_at', 'DESC']],
  });
  return !!row;
};

const peutMedecinVoirCarnet = async (medecinId, patientId) => {
  const rdvValide = await RendezVous.findOne({
    where: {
      medecin_id: medecinId,
      patient_id: patientId,
      statut: { [Op.in]: [STATUT_RDV.CONFIRME, STATUT_RDV.TERMINE] },
    },
    order: [['updatedAt', 'DESC']],
  });
  if (!rdvValide) return false;

  return aConsentementActif({
    patient_id: patientId,
    medecin_id: medecinId,
    type: CONSENTEMENT_TYPES.PARTAGE_CARNET_RDV,
  });
};

const listerPourPatient = async (patientId) => {
  const rows = await ConsentementPatient.findAll({
    where: { patient_id: patientId },
    order: [['created_at', 'DESC']],
    limit: 50,
  });
  return rows.map((r) => {
    const plain = r.toJSON ? r.toJSON() : r;
    return {
      ...plain,
      created_at: plain.created_at || plain.createdAt,
    };
  });
};

const getTextesConsentement = () => ({
  version: POLITIQUE_CONFIDENTIALITE_VERSION,
  cadre_juridique: 'Loi n° 2010/012 du 21 décembre 2010 relative à la cybersécurité et à la cybercriminalité au Cameroun, '
    + 'Code de déontologie médicale (ONMC), secret professionnel et protection des données personnelles.',
  politique_confidentialite: {
    titre: 'Politique de confidentialité DjamSanté',
    resume: 'Vos données de santé sont traitées uniquement pour la prise en charge médicale, '
      + 'conformément au secret médical. Elles ne sont ni vendues ni partagées à des tiers commerciaux.',
  },
  partage_carnet_rdv: {
    titre: 'Accès au carnet médical pour un rendez-vous',
    resume: 'J\'autorise le médecin consulté à accéder à mon carnet médical électronique '
      + '(allergies, antécédents, traitements) dans le cadre exclusif de cette consultation.',
    duree: 'Valable pour la consultation concernée et 30 jours après le rendez-vous.',
  },
  teleconsultation: {
    titre: 'Consentement téléconsultation',
    resume: 'J\'accepte une consultation à distance. Je comprends les limites du diagnostic à distance '
      + 'et m\'engage à me présenter en présentiel si le médecin l\'estime nécessaire.',
  },
  carnet_activation: {
    titre: 'Activation du carnet médical électronique',
    resume: 'Je souhaite activer mon carnet médical personnel sur DjamSanté. '
      + 'Seuls les professionnels que j\'autorise pourront le consulter.',
  },
});

module.exports = {
  enregistrer,
  enregistrerLot,
  aConsentementActif,
  peutMedecinVoirCarnet,
  listerPourPatient,
  getTextesConsentement,
  CONSENTEMENT_TYPES,
  POLITIQUE_VERSION: POLITIQUE_CONFIDENTIALITE_VERSION,
};
