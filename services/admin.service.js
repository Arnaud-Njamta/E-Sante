const {
  Patient, Medecin, Etablissement, Admin, InscriptionProfessionnel, AdminAuditLog,
} = require('../models');
const { TYPE_ETABLISSEMENT, STATUT_VALIDATION } = require('../utils/constants');

const pickPatient = (p) => ({
  id: p.id,
  type: 'patient',
  nom: p.nom,
  prenom: p.prenom,
  email: p.email,
  telephone: p.telephone,
  created_at: p.createdAt,
});

const pickMedecin = (m) => ({
  id: m.id,
  type: 'medecin',
  nom: m.nom,
  prenom: m.prenom,
  email: m.email,
  telephone: m.telephone,
  specialite: m.specialite,
  profession: m.profession || 'medecin',
  statut_validation: m.statut_validation,
  created_at: m.createdAt,
});

const pickEtab = (e) => ({
  id: e.id,
  type: e.type,
  nom: e.nom,
  email: e.email,
  telephone: e.telephone,
  ville: e.ville,
  region: e.region,
  statut_validation: e.statut_validation,
  actif: e.actif,
  latitude: e.latitude,
  longitude: e.longitude,
  created_at: e.createdAt,
});

const getOverview = async () => {
  const [
    patients,
    medecins,
    pharmacies,
    hopitaux,
    cliniques,
    admins,
    inscriptionsAttente,
    recentPatients,
    recentMedecins,
    recentEtablissements,
    recentConnexions,
  ] = await Promise.all([
    Patient.count(),
    Medecin.count({ where: { actif: true } }),
    Etablissement.count({ where: { type: TYPE_ETABLISSEMENT.PHARMACIE, actif: true } }),
    Etablissement.count({ where: { type: TYPE_ETABLISSEMENT.HOPITAL, actif: true } }),
    Etablissement.count({ where: { type: TYPE_ETABLISSEMENT.CLINIQUE, actif: true } }),
    Admin.count({ where: { actif: true } }),
    InscriptionProfessionnel.count({
      where: { statut: ['en_attente', 'en_revision', 'documents_manquants'] },
    }),
    Patient.findAll({
      attributes: ['id', 'nom', 'prenom', 'email', 'telephone', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 8,
    }),
    Medecin.findAll({
      attributes: [
        'id', 'nom', 'prenom', 'email', 'telephone', 'specialite', 'profession',
        'statut_validation', 'createdAt',
      ],
      order: [['createdAt', 'DESC']],
      limit: 8,
    }),
    Etablissement.findAll({
      attributes: [
        'id', 'type', 'nom', 'email', 'telephone', 'ville', 'region',
        'statut_validation', 'actif', 'latitude', 'longitude', 'createdAt',
      ],
      order: [['createdAt', 'DESC']],
      limit: 12,
    }),
    AdminAuditLog.findAll({
      where: { categorie: 'auth', action: 'connexion' },
      order: [['created_at', 'DESC']],
      limit: 20,
    }),
  ]);

  return {
    stats: {
      patients,
      medecins,
      pharmacies,
      hopitaux,
      cliniques,
      etablissements: pharmacies + hopitaux + cliniques,
      admins,
      inscriptions_en_attente: inscriptionsAttente,
    },
    recent: {
      patients: recentPatients.map(pickPatient),
      medecins: recentMedecins.map(pickMedecin),
      etablissements: recentEtablissements.map(pickEtab),
      connexions: recentConnexions.map((log) => {
        const plain = log.toJSON ? log.toJSON() : log;
        return {
          id: plain.id,
          action: plain.action,
          acteur_label: plain.acteur_label,
          details: plain.details,
          ip: plain.ip,
          created_at: plain.created_at || plain.createdAt,
        };
      }),
    },
  };
};

const listComptes = async ({ type = 'all', page = 1, limit = 30 } = {}) => {
  const offset = (page - 1) * limit;
  const cap = Math.min(limit, 100);

  if (type === 'patient') {
    const { rows, count } = await Patient.findAndCountAll({
      attributes: ['id', 'nom', 'prenom', 'email', 'telephone', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: cap,
      offset,
    });
    return { comptes: rows.map(pickPatient), total: count, page, limit: cap };
  }

  if (type === 'medecin') {
    const { rows, count } = await Medecin.findAndCountAll({
      attributes: [
        'id', 'nom', 'prenom', 'email', 'telephone', 'specialite', 'profession',
        'statut_validation', 'actif', 'createdAt',
      ],
      order: [['createdAt', 'DESC']],
      limit: cap,
      offset,
    });
    return { comptes: rows.map(pickMedecin), total: count, page, limit: cap };
  }

  const [patients, medecins] = await Promise.all([
    Patient.findAll({
      attributes: ['id', 'nom', 'prenom', 'email', 'telephone', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: cap,
    }),
    Medecin.findAll({
      attributes: [
        'id', 'nom', 'prenom', 'email', 'telephone', 'specialite', 'profession',
        'statut_validation', 'createdAt',
      ],
      order: [['createdAt', 'DESC']],
      limit: cap,
    }),
  ]);

  const comptes = [
    ...patients.map(pickPatient),
    ...medecins.map(pickMedecin),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, cap);

  return {
    comptes,
    total: comptes.length,
    page: 1,
    limit: cap,
  };
};

const listEtablissements = async ({ type, page = 1, limit = 30 } = {}) => {
  const offset = (page - 1) * limit;
  const cap = Math.min(limit, 100);
  const where = { actif: true };
  if (type) where.type = type;

  const { rows, count } = await Etablissement.findAndCountAll({
    where,
    attributes: [
      'id', 'type', 'nom', 'email', 'telephone', 'ville', 'region',
      'statut_validation', 'actif', 'latitude', 'longitude', 'createdAt',
    ],
    order: [['nom', 'ASC']],
    limit: cap,
    offset,
  });

  return {
    etablissements: rows.map(pickEtab),
    total: count,
    page,
    limit: cap,
  };
};

module.exports = {
  getOverview,
  listComptes,
  listEtablissements,
};
