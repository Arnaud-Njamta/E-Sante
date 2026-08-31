const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const {
  Medecin, ServiceEtablissement, RendezVous, Patient, Etablissement,
} = require('../models');
const { formatMedecin, formatMedecinForStructure } = require('./medecin.service');
const { TYPE_ETABLISSEMENT, STATUT_RDV } = require('../utils/constants');
const { parseJsonField } = require('../utils/helpers');

const SALT_ROUNDS = 12;

const formatService = (s) => {
  const data = s.toJSON ? s.toJSON() : s;
  return {
    ...data,
    prix_indicatif: data.prix_indicatif ? Number(data.prix_indicatif) : null,
  };
};

const enrichStructureDashboard = async (etab) => {
  const medecinIds = await Medecin.findAll({
    where: { etablissement_id: etab.id, actif: true },
    attributes: ['id'],
  });
  const ids = medecinIds.map((m) => m.id);

  const [nbMedecins, nbServices, rdvEnAttente, rdvAujourdhui, rdvRecents] = await Promise.all([
    Medecin.count({ where: { etablissement_id: etab.id, actif: true } }),
    ServiceEtablissement.count({ where: { etablissement_id: etab.id, disponible: true } }),
    ids.length ? RendezVous.count({ where: { etablissement_id: etab.id, statut: STATUT_RDV.EN_ATTENTE } }) : 0,
    ids.length ? RendezVous.count({
      where: { etablissement_id: etab.id, date_rdv: new Date().toISOString().split('T')[0] },
    }) : 0,
    RendezVous.findAll({
      where: { etablissement_id: etab.id },
      include: [
        { model: Patient, as: 'patient', attributes: ['id', 'nom', 'prenom', 'telephone'] },
        { model: Medecin, as: 'medecin', attributes: ['id', 'nom', 'prenom', 'specialite'] },
      ],
      order: [['date_rdv', 'DESC'], ['heure_debut', 'DESC']],
      limit: 8,
    }),
  ]);

  const medecins = await Medecin.findAll({
    where: { etablissement_id: etab.id, actif: true },
    attributes: ['id', 'nom', 'prenom', 'specialite', 'fichier_photo_id', 'photo_url', 'note_moyenne', 'nombre_avis'],
    limit: 6,
  });

  const services = await ServiceEtablissement.findAll({
    where: { etablissement_id: etab.id, disponible: true },
    order: [['nom', 'ASC']],
    limit: 6,
  });

  const profil = etab.toJSON ? etab.toJSON() : etab;
  if (profil.fichier_photo_id) {
    profil.image_url = `/api/fichiers/${profil.fichier_photo_id}`;
  }

  return {
    profil,
    stats: {
      note_moyenne: Number(etab.note_moyenne),
      nombre_avis: etab.nombre_avis,
      nb_medecins: nbMedecins,
      nb_services: nbServices,
      rdv_en_attente: rdvEnAttente,
      rdv_aujourdhui: rdvAujourdhui,
      type: etab.type,
    },
    medecins: medecins.map(formatMedecinForStructure),
    services: services.map(formatService),
    rdv_recents: rdvRecents,
    horaires: parseJsonField(etab.horaires_ouverture, {}),
    valeur_ajoutee: {
      pays: 'Cameroun',
      alignement: 'Plan National Santé Numérique MINSANTE — CSU',
      devise: 'XAF (FCFA)',
    },
  };
};

const listMedecins = async (etablissementId) => {
  const rows = await Medecin.findAll({
    where: { etablissement_id: etablissementId },
    order: [['nom', 'ASC']],
  });
  return rows.map(formatMedecinForStructure);
};

const addMedecin = async (etablissementId, data) => {
  const etab = await Etablissement.findByPk(etablissementId);
  if (!etab || ![TYPE_ETABLISSEMENT.HOPITAL, TYPE_ETABLISSEMENT.CLINIQUE].includes(etab.type)) {
    const error = new Error('Seuls hôpitaux et cliniques peuvent inscrire des médecins');
    error.statusCode = 403;
    throw error;
  }

  if (data.email) {
    const exist = await Medecin.findOne({ where: { email: data.email } });
    if (exist) {
      const error = new Error('Un médecin avec cet email existe déjà');
      error.statusCode = 409;
      throw error;
    }
  }

  let password_hash = null;
  if (data.password) {
    password_hash = await bcrypt.hash(data.password, SALT_ROUNDS);
  }

  const medecin = await Medecin.create({
    etablissement_id: etablissementId,
    nom: data.nom,
    prenom: data.prenom,
    specialite: data.specialite,
    numero_ordre: data.numero_ordre,
    bio: data.bio,
    telephone: data.telephone,
    email: data.email || null,
    password_hash,
    tarif_consultation_fcfa: null,
    actif: true,
    statut_validation: 'valide',
  });

  return formatMedecinForStructure(medecin);
};

const updateMedecinStructure = async (etablissementId, medecinId, data) => {
  const medecin = await Medecin.findOne({ where: { id: medecinId, etablissement_id: etablissementId } });
  if (!medecin) {
    const error = new Error('Médecin non trouvé dans votre établissement');
    error.statusCode = 404;
    throw error;
  }
  const allowed = ['nom', 'prenom', 'specialite', 'numero_ordre', 'bio', 'telephone', 'actif'];
  allowed.forEach((k) => { if (data[k] !== undefined) medecin[k] = data[k]; });
  await medecin.save();
  return formatMedecinForStructure(medecin);
};

const listServices = async (etablissementId) => {
  const rows = await ServiceEtablissement.findAll({
    where: { etablissement_id: etablissementId },
    order: [['categorie', 'ASC'], ['nom', 'ASC']],
  });
  return rows.map(formatService);
};

const createService = async (etablissementId, data) => ServiceEtablissement.create({
  etablissement_id: etablissementId,
  nom: data.nom,
  description: data.description,
  categorie: data.categorie || 'Consultation',
  prix_indicatif: data.prix_indicatif,
  duree_minutes: data.duree_minutes,
  disponible: true,
}).then(formatService);

const updateService = async (etablissementId, serviceId, data) => {
  const service = await ServiceEtablissement.findOne({
    where: { id: serviceId, etablissement_id: etablissementId },
  });
  if (!service) {
    const error = new Error('Service non trouvé');
    error.statusCode = 404;
    throw error;
  }
  await service.update(data);
  return formatService(service);
};

const deleteService = async (etablissementId, serviceId) => {
  const service = await ServiceEtablissement.findOne({
    where: { id: serviceId, etablissement_id: etablissementId },
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

const listRendezVous = async (etablissementId, { statut, date } = {}) => {
  const where = { etablissement_id: etablissementId };
  if (statut) where.statut = statut;
  if (date) where.date_rdv = date;

  return RendezVous.findAll({
    where,
    include: [
      { model: Patient, as: 'patient', attributes: ['id', 'nom', 'prenom', 'telephone', 'email'] },
      { model: Medecin, as: 'medecin', attributes: ['id', 'nom', 'prenom', 'specialite'] },
    ],
    order: [['date_rdv', 'DESC'], ['heure_debut', 'ASC']],
    limit: 100,
  });
};

module.exports = {
  enrichStructureDashboard,
  listMedecins,
  addMedecin,
  updateMedecinStructure,
  listServices,
  createService,
  updateService,
  deleteService,
  listRendezVous,
};
