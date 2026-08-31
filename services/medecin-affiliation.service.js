const { MedecinAffiliation, Etablissement, Medecin } = require('../models');
const { TYPE_ETABLISSEMENT } = require('../utils/constants');
const { parseJsonField } = require('../utils/helpers');

const formatAffiliation = (row) => {
  const data = row.toJSON ? row.toJSON() : { ...row };
  return {
    ...data,
    horaires: parseJsonField(data.horaires, null),
    etablissement: data.etablissement || undefined,
  };
};

const listerPourMedecin = async (medecinId, { inclure_terminees = false } = {}) => {
  const where = { medecin_id: medecinId };
  if (!inclure_terminees) {
    where.statut = ['en_attente', 'actif'];
  }
  const rows = await MedecinAffiliation.findAll({
    where,
    include: [{
      model: Etablissement,
      as: 'etablissement',
      attributes: ['id', 'nom', 'type', 'ville', 'adresse'],
      required: false,
    }],
    order: [['actuel', 'DESC'], ['createdAt', 'DESC']],
  });
  return rows.map(formatAffiliation);
};

const listerActivesPourMedecin = async (medecinId) => {
  const rows = await MedecinAffiliation.findAll({
    where: { medecin_id: medecinId, statut: 'actif' },
    include: [{
      model: Etablissement,
      as: 'etablissement',
      attributes: ['id', 'nom', 'type', 'ville', 'adresse'],
      required: false,
    }],
    order: [['actuel', 'DESC'], ['createdAt', 'DESC']],
  });
  return rows.map(formatAffiliation);
};

const listerPourEtablissement = async (etablissementId) => {
  const rows = await MedecinAffiliation.findAll({
    where: { etablissement_id: etablissementId },
    include: [{
      model: Medecin,
      as: 'medecin',
      attributes: ['id', 'nom', 'prenom', 'specialite', 'email', 'fichier_photo_id', 'numero_ordre'],
    }],
    order: [['statut', 'ASC'], ['createdAt', 'DESC']],
  });
  return rows.map(formatAffiliation);
};

const inviterMedecin = async (etablissementId, { email, role = 'employe', message }) => {
  const etab = await Etablissement.findByPk(etablissementId);
  if (!etab || ![TYPE_ETABLISSEMENT.HOPITAL, TYPE_ETABLISSEMENT.CLINIQUE].includes(etab.type)) {
    const error = new Error('Seuls hôpitaux et cliniques peuvent inviter des médecins');
    error.statusCode = 403;
    throw error;
  }

  const medecin = await Medecin.findOne({ where: { email: email.trim().toLowerCase() } });
  if (!medecin) {
    const error = new Error('Aucun médecin inscrit avec cet email. Le praticien doit d\'abord créer son compte sur DjamSanté.');
    error.statusCode = 404;
    throw error;
  }

  const existante = await MedecinAffiliation.findOne({
    where: {
      medecin_id: medecin.id,
      etablissement_id: etablissementId,
      statut: ['en_attente', 'actif'],
    },
  });
  if (existente) {
    const error = new Error('Une invitation ou affiliation active existe déjà pour ce médecin');
    error.statusCode = 409;
    throw error;
  }

  const affiliation = await MedecinAffiliation.create({
    medecin_id: medecin.id,
    etablissement_id: etablissementId,
    type_lieu: etab.type === TYPE_ETABLISSEMENT.HOPITAL ? 'hopital' : 'clinique',
    role,
    statut: 'en_attente',
    message_invitation: message || `Invitation de ${etab.nom}`,
    actuel: true,
  });

  return formatAffiliation(await affiliation.reload({
    include: [{ model: Etablissement, as: 'etablissement', attributes: ['id', 'nom', 'type', 'ville'] }],
  }));
};

const creerCabinetPrive = async (medecinId, data) => {
  const existant = await MedecinAffiliation.findOne({
    where: { medecin_id: medecinId, type_lieu: 'cabinet_prive', statut: 'actif' },
  });
  if (existant && !data.remplacer) {
    const error = new Error('Vous avez déjà un cabinet privé actif. Modifiez-le ou désactivez-le d\'abord.');
    error.statusCode = 409;
    throw error;
  }

  if (existant && data.remplacer) {
    await existant.update({ statut: 'termine', actuel: false, date_fin: new Date().toISOString().split('T')[0] });
  }

  const affiliation = await MedecinAffiliation.create({
    medecin_id: medecinId,
    etablissement_id: null,
    type_lieu: 'cabinet_prive',
    role: 'titulaire',
    statut: 'actif',
    nom_lieu: data.nom_lieu,
    adresse: data.adresse,
    ville: data.ville,
    horaires: data.horaires || null,
    date_debut: data.date_debut || new Date().toISOString().split('T')[0],
    actuel: true,
  });

  return formatAffiliation(affiliation);
};

const repondreInvitation = async (medecinId, affiliationId, accepter) => {
  const affiliation = await MedecinAffiliation.findOne({
    where: { id: affiliationId, medecin_id: medecinId, statut: 'en_attente' },
    include: [{ model: Etablissement, as: 'etablissement' }],
  });
  if (!affiliation) {
    const error = new Error('Invitation non trouvée');
    error.statusCode = 404;
    throw error;
  }

  if (accepter) {
    await affiliation.update({
      statut: 'actif',
      date_debut: new Date().toISOString().split('T')[0],
    });
    // Legacy: keep primary etablissement_id for backward compat
    const medecin = await Medecin.findByPk(medecinId);
    if (!medecin.etablissement_id) {
      await medecin.update({ etablissement_id: affiliation.etablissement_id });
    }
  } else {
    await affiliation.update({ statut: 'refuse', actuel: false });
  }

  return formatAffiliation(affiliation);
};

const terminerAffiliation = async (medecinId, affiliationId) => {
  const affiliation = await MedecinAffiliation.findOne({
    where: { id: affiliationId, medecin_id: medecinId, statut: 'actif' },
  });
  if (!affiliation) {
    const error = new Error('Affiliation non trouvée');
    error.statusCode = 404;
    throw error;
  }
  await affiliation.update({
    statut: 'termine',
    actuel: false,
    date_fin: new Date().toISOString().split('T')[0],
  });
  return formatAffiliation(affiliation);
};

const mettreAJourAffiliation = async (medecinId, affiliationId, data) => {
  const affiliation = await MedecinAffiliation.findOne({
    where: { id: affiliationId, medecin_id: medecinId, statut: 'actif' },
  });
  if (!affiliation) {
    const error = new Error('Affiliation non trouvée');
    error.statusCode = 404;
    throw error;
  }
  const allowed = ['nom_lieu', 'adresse', 'ville', 'horaires', 'role', 'actuel'];
  allowed.forEach((k) => { if (data[k] !== undefined) affiliation[k] = data[k]; });
  await affiliation.save();
  return formatAffiliation(affiliation);
};

module.exports = {
  formatAffiliation,
  listerPourMedecin,
  listerActivesPourMedecin,
  listerPourEtablissement,
  inviterMedecin,
  creerCabinetPrive,
  repondreInvitation,
  terminerAffiliation,
  mettreAJourAffiliation,
};
