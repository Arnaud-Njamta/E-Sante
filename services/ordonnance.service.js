const path = require('path');
const fs = require('fs');
const { Ordonnance } = require('../models');
const { parseJsonField } = require('../utils/helpers');
const traitementService = require('./traitement.service');

const formatOrdonnance = (ordonnance) => {
  const data = ordonnance.toJSON ? ordonnance.toJSON() : { ...ordonnance };
  const donnees = parseJsonField(data.donnees_parsees, {});
  return {
    ...data,
    donnees_parsees: donnees,
    medicaments_extraits: donnees.medicaments || [],
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

/**
 * Scanner une ordonnance (upload image + extraction OCR simulée)
 *
 * NOTE: En production, intégrer Google Cloud Vision API ou Tesseract OCR ici.
 * Pour le MVP, cette fonction simule l'extraction OCR et retourne des données structurées.
 */
const scanOrdonnance = async (patientId, file) => {
  if (!file) {
    const error = new Error('Aucun fichier fourni');
    error.statusCode = 400;
    throw error;
  }

  const imageUrl = `/uploads/${file.filename}`;

  // Créer l'entrée ordonnance
  const ordonnance = await Ordonnance.create({
    patient_id: patientId,
    image_url: imageUrl,
    statut: 'en_cours',
    date_scan: new Date(),
  });

  // ====================================================
  // TODO: Intégrer le service OCR réel ici
  // Exemple avec Google Cloud Vision API :
  //   const visionClient = new vision.ImageAnnotatorClient();
  //   const [result] = await visionClient.textDetection(file.path);
  //   const texteExtrait = result.fullTextAnnotation.text;
  //
  // Exemple avec Tesseract.js :
  //   const { data: { text } } = await Tesseract.recognize(file.path, 'fra');
  //   const texteExtrait = text;
  // ====================================================

  // Simulation OCR - texte extrait
  const texteExtrait = '[OCR] Texte extrait de l\'ordonnance - Intégrer un service OCR réel en production';

  // Simulation parsing - données structurées
  const donneesParsees = {
    medicaments: [
      {
        nom: 'Exemple Médicament',
        dosage: '500mg',
        forme: 'comprime',
        frequence: '3',
        instructions: 'avec repas',
        duree: '30 jours',
      },
    ],
    medecin: 'Dr. Exemple',
    date_ordonnance: new Date().toISOString().split('T')[0],
    note: 'Données simulées - Connecter un service OCR pour extraction réelle',
  };

  await ordonnance.update({
    texte_extrait: texteExtrait,
    donnees_parsees: donneesParsees,
  });

  return {
    ...formatOrdonnance(ordonnance),
    ocr_disclaimer: 'Extraction automatique simulée. Vérifiez et corrigez chaque médicament avant validation. En production, un service OCR certifié sera utilisé.',
    extraction_simulee: true,
  };
};

/**
 * Valider une ordonnance scannée et créer les traitements correspondants
 */
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
    const error = new Error('Aucun médicament détecté sur cette ordonnance. Re-scannez l\'image ou contactez votre médecin.');
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

/**
 * Récupérer les ordonnances d'un patient
 */
const getAll = async (patientId) => {
  const rows = await Ordonnance.findAll({
    where: { patient_id: patientId },
    order: [['date_scan', 'DESC']],
  });
  return rows.map(formatOrdonnance);
};

// ==================== HELPERS ====================

/**
 * Calculer la date de fin à partir d'une durée textuelle
 */
const calculerDateFin = (duree) => {
  const match = duree.match(/(\d+)\s*(jour|semaine|mois)/i);
  if (!match) return null;

  const nombre = parseInt(match[1]);
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
};
