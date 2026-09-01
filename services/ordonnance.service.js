const path = require('path');
const fs = require('fs').promises;
const { Ordonnance } = require('../models');
const { parseJsonField } = require('../utils/helpers');
const traitementService = require('./traitement.service');
const ordonnanceVerification = require('./ordonnance-verification.service');

const formatOrdonnance = (ordonnance) => {
  const data = ordonnance.toJSON ? ordonnance.toJSON() : { ...ordonnance };
  const donnees = parseJsonField(data.donnees_parsees, {});
  const verification = donnees.verification_ia || null;
  return {
    ...data,
    donnees_parsees: donnees,
    medicaments_extraits: donnees.medicaments || [],
    verification_ia: verification,
    acceptable_pharmacie: ordonnanceVerification.estAcceptablePharmacie(verification)
      || data.statut === 'validee',
    nom_fichier: data.image_url ? path.basename(data.image_url) : null,
  };
};

const resolveMedicaments = (corrections, donneesParsees) => {
  const parsed = parseJsonField(donneesParsees, {});
  const base = Array.isArray(parsed.medicaments) ? parsed.medicaments : [];
  if (Array.isArray(corrections) && corrections.length > 0) return corrections;
  if (corrections?.medicaments?.length) return corrections.medicaments;
  return base;
};

const buildDonneesFromVerification = (verification) => {
  const meds = (verification.medicaments || []).map((m) => ({
    nom: m.nom || m.dci || 'Médicament',
    dosage: m.dosage || '',
    forme: m.forme || 'comprime',
    frequence: m.posologie || m.frequence || '',
    instructions: m.instructions || '',
    duree: m.duree || '30 jours',
  }));

  return {
    medicaments: meds,
    medecin: verification.medecin || null,
    date_ordonnance: verification.date_ordonnance || new Date().toISOString().split('T')[0],
    verification_ia: verification,
  };
};

const scanOrdonnance = async (patientId, file) => {
  if (!file) {
    const error = new Error('Aucun fichier fourni');
    error.statusCode = 400;
    throw error;
  }

  const imageUrl = `/uploads/${file.filename}`;
  const filePath = file.path || path.join(process.env.UPLOAD_DIR || './uploads', file.filename);

  const ordonnance = await Ordonnance.create({
    patient_id: patientId,
    image_url: imageUrl,
    statut: 'en_cours',
    date_scan: new Date(),
  });

  let verification;
  try {
    verification = await ordonnanceVerification.analyserFichier(filePath, file.mimetype);
  } catch {
    verification = { verdict: 'acceptable', score_confiance: 40, medicaments: [], alertes: ['Analyse partielle'] };
  }

  const donneesParsees = buildDonneesFromVerification(verification);
  const texteExtrait = verification.resume
    || `[IA] Ordonnance analysée — verdict: ${verification.verdict || 'en attente'}`;

  await ordonnance.update({
    texte_extrait: texteExtrait,
    donnees_parsees: donneesParsees,
  });

  const formatted = formatOrdonnance(ordonnance);
  return {
    ...formatted,
    ocr_disclaimer: verification.mode === 'gemini'
      ? 'Analyse automatique par IA — vérifiez les médicaments détectés avant validation.'
      : 'Pré-contrôle automatique — un pharmacien confirmera votre ordonnance.',
    extraction_ia: verification.mode === 'gemini',
  };
};

const validerOrdonnance = async (ordonnanceId, patientId, patient, corrections) => {
  const ordonnance = await Ordonnance.findOne({
    where: { id: ordonnanceId, patient_id: patientId },
  });

  if (!ordonnance) {
    const error = new Error('Ordonnance non trouvée');
    error.statusCode = 404;
    throw error;
  }

  if (ordonnance.statut === 'validee') {
    const error = new Error('Cette ordonnance a déjà été validée');
    error.statusCode = 400;
    throw error;
  }

  const medicaments = resolveMedicaments(corrections, ordonnance.donnees_parsees);
  if (!medicaments.length) {
    const error = new Error('Aucun médicament détecté. Corrigez la liste ou re-scannez l\'ordonnance.');
    error.statusCode = 400;
    throw error;
  }

  const traitementsCrees = [];
  for (const med of medicaments) {
    if (!med.nom?.trim()) continue;
    const traitement = await traitementService.create(patientId, {
      nom_medicament: med.nom,
      dosage: med.dosage,
      forme: med.forme || 'comprime',
      frequence: med.frequence,
      instructions: med.instructions,
      date_debut: new Date(),
      date_fin: med.duree ? calculerDateFin(med.duree) : null,
    }, patient);
    traitementsCrees.push(traitement);
  }

  if (!traitementsCrees.length) {
    const error = new Error('Impossible de créer les traitements — vérifiez les noms de médicaments.');
    error.statusCode = 400;
    throw error;
  }

  const donneesExistantes = parseJsonField(ordonnance.donnees_parsees, {});
  await ordonnance.update({
    statut: 'validee',
    donnees_parsees: { ...donneesExistantes, medicaments },
  });

  return {
    ordonnance: formatOrdonnance(ordonnance),
    traitements: traitementsCrees,
  };
};

const getById = async (ordonnanceId, patientId) => {
  const ordonnance = await Ordonnance.findOne({
    where: { id: ordonnanceId, patient_id: patientId },
  });
  if (!ordonnance) {
    const error = new Error('Ordonnance non trouvée');
    error.statusCode = 404;
    throw error;
  }
  return formatOrdonnance(ordonnance);
};

const getAll = async (patientId) => {
  const rows = await Ordonnance.findAll({
    where: { patient_id: patientId },
    order: [['date_scan', 'DESC']],
  });
  return rows.map(formatOrdonnance);
};

const listerPourPharmacie = async (patientId) => {
  const rows = await Ordonnance.findAll({
    where: { patient_id: patientId },
    order: [['date_scan', 'DESC']],
    limit: 20,
  });
  return rows
    .map(formatOrdonnance)
    .filter((o) => o.acceptable_pharmacie || o.statut === 'validee');
};

const peutUtiliserEnPharmacie = async (ordonnanceId, patientId) => {
  const ord = await getById(ordonnanceId, patientId);
  if (!ord.acceptable_pharmacie && ord.statut !== 'validee') {
    const error = new Error('Ordonnance non validée — scannez à nouveau ou attendez la vérification');
    error.statusCode = 400;
    throw error;
  }
  return ord;
};

const calculerDateFin = (duree) => {
  const match = duree.match(/(\d+)\s*(jour|semaine|mois)/i);
  if (!match) return null;
  const nombre = parseInt(match[1], 10);
  const unite = match[2].toLowerCase();
  const dateFin = new Date();
  if (unite.startsWith('jour')) dateFin.setDate(dateFin.getDate() + nombre);
  else if (unite.startsWith('semaine')) dateFin.setDate(dateFin.getDate() + nombre * 7);
  else if (unite.startsWith('mois')) dateFin.setMonth(dateFin.getMonth() + nombre);
  return dateFin;
};

module.exports = {
  scanOrdonnance,
  validerOrdonnance,
  getAll,
  getById,
  listerPourPharmacie,
  peutUtiliserEnPharmacie,
  formatOrdonnance,
};
