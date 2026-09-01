const { Op } = require('sequelize');
const { Medecin, Etablissement, Avis, MedecinAffiliation } = require('../models');
const { TYPE_CIBLE_AVIS, STATUT_VALIDATION } = require('../utils/constants');
const { parseJsonField } = require('../utils/helpers');
const affiliationService = require('./medecin-affiliation.service');
const parcoursService = require('./parcours-professionnel.service');

const formatMedecin = (medecin) => {
  const data = medecin.toJSON ? medecin.toJSON() : { ...medecin };
  delete data.password_hash;

  const competences = parseJsonField(data.competences, []);
  const langues = parseJsonField(data.langues, ['Français']);
  const horaires_consultation = parseJsonField(data.horaires_consultation, {});

  return {
    ...data,
    competences: Array.isArray(competences) ? competences : [],
    langues: Array.isArray(langues) ? langues : ['Français'],
    horaires_consultation: typeof horaires_consultation === 'object' ? horaires_consultation : {},
    note_moyenne: Number(data.note_moyenne) || 5,
    photo_url: data.fichier_photo_id ? `/api/fichiers/${data.fichier_photo_id}` : data.photo_url,
    cachet_url: data.fichier_cachet_id ? `/api/fichiers/${data.fichier_cachet_id}` : null,
    signature_url: data.fichier_signature_id ? `/api/fichiers/${data.fichier_signature_id}` : null,
  };
};

/** Vue établissement — tarif privé (visible uniquement par le médecin et les patients). */
const formatMedecinForStructure = (medecin) => {
  const data = formatMedecin(medecin);
  delete data.tarif_consultation_fcfa;
  return data;
};

const enrichMedecinPublic = async (medecin) => {
  const formatted = formatMedecin(medecin);
  const [affiliations, parcours] = await Promise.all([
    affiliationService.listerActivesPourMedecin(formatted.id),
    parcoursService.listerPourMedecin(formatted.id),
  ]);
  return { ...formatted, affiliations, parcours };
};

const lister = async ({
  specialite, recherche, etablissement_id, competence, disponible_maintenant, page = 1, limit = 20,
}) => {
  const where = { actif: true, statut_validation: STATUT_VALIDATION.VALIDE };

  if (specialite) where.specialite = { [Op.like]: `%${specialite}%` };
  const andConditions = [];
  if (etablissement_id) {
    const affRows = await MedecinAffiliation.findAll({
      where: { etablissement_id, statut: 'actif' },
      attributes: ['medecin_id'],
    });
    const affIds = affRows.map((r) => r.medecin_id);
    andConditions.push({
      [Op.or]: [
        { etablissement_id },
        ...(affIds.length ? [{ id: { [Op.in]: affIds } }] : []),
      ],
    });
  }
  if (disponible_maintenant === 'true' || disponible_maintenant === true) {
    where.disponible_maintenant = true;
  }
  if (recherche) {
    andConditions.push({
      [Op.or]: [
        { nom: { [Op.like]: `%${recherche}%` } },
        { prenom: { [Op.like]: `%${recherche}%` } },
        { specialite: { [Op.like]: `%${recherche}%` } },
      ],
    });
  }
  if (competence) {
    where.competences = { [Op.like]: `%${competence}%` };
  }
  if (andConditions.length) {
    where[Op.and] = andConditions;
  }

  const offset = (page - 1) * limit;

  const { rows, count } = await Medecin.findAndCountAll({
    where,
    attributes: { exclude: ['password_hash'] },
    include: [
      {
        model: Etablissement,
        as: 'etablissement',
        attributes: ['id', 'nom', 'type', 'ville', 'adresse'],
        required: false,
      },
    ],
    order: [['note_moyenne', 'DESC'], ['nom', 'ASC']],
    limit,
    offset,
  });

  return {
    medecins: rows.map(formatMedecin),
    pagination: { total: count, page, limit, pages: Math.ceil(count / limit) },
  };
};

const getById = async (id) => {
  const medecin = await Medecin.findOne({
    where: { id, actif: true },
    attributes: { exclude: ['password_hash'] },
    include: [
      {
        model: Etablissement,
        as: 'etablissement',
        attributes: ['id', 'nom', 'type', 'ville', 'adresse', 'telephone'],
      },
    ],
  });

  if (!medecin) {
    const error = new Error('Médecin non trouvé');
    error.statusCode = 404;
    throw error;
  }

  return enrichMedecinPublic(medecin);
};

const getProfile = async (medecinId) => getById(medecinId);

const getDashboard = async (medecinId) => {
  const medecin = await getById(medecinId);

  const avisRecents = await Avis.findAll({
    where: { cible_type: TYPE_CIBLE_AVIS.MEDECIN, cible_id: medecinId },
    order: [['createdAt', 'DESC']],
    limit: 5,
  });

  const repartitionNotes = await Avis.findAll({
    where: { cible_type: TYPE_CIBLE_AVIS.MEDECIN, cible_id: medecinId },
    attributes: ['note'],
  });

  const notes = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  repartitionNotes.forEach((a) => { notes[a.note] = (notes[a.note] || 0) + 1; });

  return {
    profil: medecin,
    stats: {
      note_moyenne: medecin.note_moyenne,
      nombre_avis: medecin.nombre_avis,
      competences_count: medecin.competences.length,
      annees_experience: medecin.annees_experience || 0,
      rdv_en_attente: 0,
    },
    avis_recents: avisRecents,
    repartition_notes: notes,
  };
};

const updateProfil = async (medecinId, data) => {
  const medecin = await Medecin.findByPk(medecinId);
  if (!medecin) {
    const error = new Error('Médecin non trouvé');
    error.statusCode = 404;
    throw error;
  }
  const allowed = ['bio', 'competences', 'langues', 'telephone', 'specialite',
    'accepte_teleconsultation', 'tarif_consultation_fcfa', 'annees_experience',
    'disponible_maintenant', 'joignable_urgence'];
  allowed.forEach((k) => { if (data[k] !== undefined) medecin[k] = data[k]; });
  await medecin.save();
  return formatMedecin(medecin);
};

const updateHoraires = async (medecinId, horaires) => {
  const medecin = await Medecin.findByPk(medecinId);
  if (!medecin) {
    const error = new Error('Médecin non trouvé');
    error.statusCode = 404;
    throw error;
  }
  medecin.horaires_consultation = horaires;
  await medecin.save();
  return formatMedecin(medecin);
};

const uploadPhoto = async (medecinId, fichierMeta) => {
  const medecin = await Medecin.findByPk(medecinId);
  medecin.fichier_photo_id = fichierMeta.id;
  medecin.photo_url = fichierMeta.url;
  await medecin.save();
  return formatMedecin(medecin);
};

const uploadCachet = async (medecinId, fichierMeta) => {
  const medecin = await Medecin.findByPk(medecinId);
  medecin.fichier_cachet_id = fichierMeta.id;
  await medecin.save();
  return formatMedecin(medecin);
};

const uploadSignature = async (medecinId, fichierMeta) => {
  const medecin = await Medecin.findByPk(medecinId);
  medecin.fichier_signature_id = fichierMeta.id;
  await medecin.save();
  return formatMedecin(medecin);
};

module.exports = {
  lister, getById, getProfile, getDashboard, updateProfil, updateHoraires,
  uploadPhoto, uploadCachet, uploadSignature,
  formatMedecin, formatMedecinForStructure,
};
