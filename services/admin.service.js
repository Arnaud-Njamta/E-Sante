const { Op } = require('sequelize');
const {
  Patient, Medecin, Etablissement, Admin, InscriptionProfessionnel, AdminAuditLog,
} = require('../models');
const { TYPE_ETABLISSEMENT } = require('../utils/constants');

const OVERVIEW_CACHE_TTL = parseInt(process.env.ADMIN_OVERVIEW_CACHE_TTL_MS || '30000', 10);
let overviewCache = { data: null, expires: 0 };

const safe = async (label, fn, fallback) => {
  try {
    return await fn();
  } catch (err) {
    console.warn(`[admin/overview] ${label}:`, err.message);
    return fallback;
  }
};

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
  latitude: e.latitude ?? null,
  longitude: e.longitude ?? null,
  created_at: e.createdAt,
});

const pickInscription = (i) => ({
  id: i.id,
  type: i.type_profil,
  nom: i.nom_structure || [i.prenom, i.nom].filter(Boolean).join(' ') || i.nom,
  prenom: i.prenom,
  email: i.email,
  telephone: i.telephone,
  ville: i.ville,
  statut: i.statut,
  created_at: i.createdAt,
});

const buildOverview = async () => {
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
    recentInscriptionsPro,
    recentActivite,
  ] = await Promise.all([
    safe('patients.count', () => Patient.count(), 0),
    safe('medecins.count', () => Medecin.count({ where: { actif: true } }), 0),
    safe('pharmacies.count', () => Etablissement.count({
      where: { type: TYPE_ETABLISSEMENT.PHARMACIE, actif: true },
    }), 0),
    safe('hopitaux.count', () => Etablissement.count({
      where: { type: TYPE_ETABLISSEMENT.HOPITAL, actif: true },
    }), 0),
    safe('cliniques.count', () => Etablissement.count({
      where: { type: TYPE_ETABLISSEMENT.CLINIQUE, actif: true },
    }), 0),
    safe('admins.count', () => Admin.count({ where: { actif: true } }), 0),
    safe('inscriptions.count', () => InscriptionProfessionnel.count({
      where: {
        statut: { [Op.in]: ['en_attente', 'en_revision', 'documents_manquants'] },
      },
    }), 0),
    safe('patients.recent', () => Patient.findAll({
      attributes: ['id', 'nom', 'prenom', 'email', 'telephone', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 12,
    }), []),
    safe('medecins.recent', () => Medecin.findAll({
      attributes: [
        'id', 'nom', 'prenom', 'email', 'telephone', 'specialite',
        'statut_validation', 'createdAt',
      ],
      order: [['createdAt', 'DESC']],
      limit: 12,
    }), []),
    safe('etablissements.recent', () => Etablissement.findAll({
      attributes: [
        'id', 'type', 'nom', 'email', 'telephone', 'ville', 'region',
        'statut_validation', 'actif', 'createdAt',
      ],
      order: [['createdAt', 'DESC']],
      limit: 12,
    }), []),
    safe('inscriptions.recent', () => InscriptionProfessionnel.findAll({
      attributes: [
        'id', 'type_profil', 'email', 'nom', 'prenom', 'nom_structure',
        'telephone', 'ville', 'statut', 'createdAt',
      ],
      order: [['createdAt', 'DESC']],
      limit: 15,
    }), []),
    safe('activite.recent', () => AdminAuditLog.findAll({
      where: {
        [Op.or]: [
          { categorie: 'auth', action: 'connexion' },
          { categorie: 'inscription' },
        ],
      },
      order: [['created_at', 'DESC']],
      limit: 30,
    }), []),
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
      inscriptions_pro: recentInscriptionsPro.map(pickInscription),
      connexions: recentActivite.map((log) => {
        const plain = log.toJSON ? log.toJSON() : log;
        return {
          id: plain.id,
          categorie: plain.categorie,
          action: plain.action,
          acteur_label: plain.acteur_label,
          details: plain.details,
          ip: plain.ip,
          created_at: plain.created_at || plain.createdAt,
        };
      }),
    },
    fetched_at: new Date().toISOString(),
  };
};

const getOverview = async () => {
  const now = Date.now();
  if (overviewCache.data && overviewCache.expires > now) {
    return { ...overviewCache.data, fetched_at: new Date().toISOString(), cached: true };
  }
  const data = await buildOverview();
  overviewCache = { data, expires: now + OVERVIEW_CACHE_TTL };
  return data;
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
        'id', 'nom', 'prenom', 'email', 'telephone', 'specialite',
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
        'id', 'nom', 'prenom', 'email', 'telephone', 'specialite',
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
      'statut_validation', 'actif', 'createdAt',
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
