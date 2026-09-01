const crypto = require('crypto');
const { Op } = require('sequelize');
const {
  ReservationDispensaire, Patient, Etablissement, ProduitPharmacie,
  OrdonnanceElectronique, Ordonnance,
} = require('../models');
const { STATUT_RESERVATION, STATUT_ORDONNANCE_ELEC, TYPE_ETABLISSEMENT } = require('../utils/constants');
const { parseJsonField } = require('../utils/helpers');
const commissionService = require('./commission.service');
const paiementService = require('./paiement.service');

const genererNumero = () => {
  const annee = new Date().getFullYear();
  const seq = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `RES-CM-${annee}-${seq}`;
};

const normaliser = (s) => (s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim();

const trouverProduit = (nomMedicament, produits) => {
  const n = normaliser(nomMedicament);
  if (!n) return null;
  const mots = n.split(/\s+/).filter((w) => w.length > 2);

  let best = null;
  let bestScore = 0;

  produits.forEach((p) => {
    const pn = normaliser(p.nom);
    let score = 0;
    if (pn.includes(n) || n.includes(pn)) score = 100;
    else {
      mots.forEach((mot) => {
        if (pn.includes(mot)) score += 30;
      });
    }
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  });

  return bestScore >= 30 ? best : null;
};

const calculerMontant = (lignes) => lignes.reduce(
  (sum, l) => sum + (Number(l.prix_fcfa_unitaire) || 0) * (Number(l.quantite) || 1),
  0,
);

const formatReservation = async (r) => {
  const data = r.toJSON ? r.toJSON() : r;
  const tx = await commissionService.getTransactionByReference('reservation_dispensaire', data.id);
  return {
    ...data,
    lignes: parseJsonField(data.lignes, []),
    transaction: paiementService.formatTransaction(tx),
  };
};

const creer = async (patientId, {
  etablissement_id, lignes, message_patient, ordonnance_electronique_id,
  ordonnance_papier_id, date_retrait_souhaitee,
}) => {
  if (!lignes?.length) {
    const error = new Error('Ajoutez au moins un produit à réserver');
    error.statusCode = 400;
    throw error;
  }

  const etab = await Etablissement.findOne({
    where: {
      id: etablissement_id,
      type: { [Op.in]: [TYPE_ETABLISSEMENT.PHARMACIE, TYPE_ETABLISSEMENT.HOPITAL, TYPE_ETABLISSEMENT.CLINIQUE] },
      actif: true,
    },
  });
  if (!etab) {
    const error = new Error('Établissement non trouvé');
    error.statusCode = 404;
    throw error;
  }

  if (ordonnance_electronique_id) {
    const ord = await OrdonnanceElectronique.findOne({
      where: { id: ordonnance_electronique_id, patient_id: patientId, statut: STATUT_ORDONNANCE_ELEC.SIGNEE },
    });
    if (!ord) {
      const error = new Error('Ordonnance électronique invalide');
      error.statusCode = 400;
      throw error;
    }
  }

  if (ordonnance_papier_id) {
    const ordonnanceService = require('./ordonnance.service');
    await ordonnanceService.peutUtiliserEnPharmacie(ordonnance_papier_id, patientId);
  }

  const lignesValidees = [];
  for (const ligne of lignes) {
    const produit = await ProduitPharmacie.findOne({
      where: { id: ligne.produit_id, pharmacie_id: etablissement_id, actif: true },
    });
    if (!produit) {
      const error = new Error(`Produit introuvable: ${ligne.nom || ligne.produit_id}`);
      error.statusCode = 400;
      throw error;
    }
    if (produit.necessite_ordonnance && !ordonnance_electronique_id && !ordonnance_papier_id) {
      const error = new Error(`${produit.nom} nécessite une ordonnance — scannez ou sélectionnez votre ordonnance`);
      error.statusCode = 400;
      throw error;
    }
    const qte = Math.max(1, parseInt(ligne.quantite, 10) || 1);
    if (produit.stock_disponible < qte) {
      const error = new Error(`Stock insuffisant pour ${produit.nom}`);
      error.statusCode = 400;
      throw error;
    }
    lignesValidees.push({
      produit_id: produit.id,
      nom: produit.nom,
      quantite: qte,
      prix_fcfa_unitaire: produit.prix_fcfa,
      necessite_ordonnance: produit.necessite_ordonnance,
    });
  }

  const montantTotal = calculerMontant(lignesValidees);

  const reservation = await ReservationDispensaire.create({
    numero_reference: genererNumero(),
    patient_id: patientId,
    etablissement_id,
    ordonnance_electronique_id: ordonnance_electronique_id || null,
    ordonnance_papier_id: ordonnance_papier_id || null,
    lignes: lignesValidees,
    message_patient,
    date_retrait_souhaitee: date_retrait_souhaitee || null,
    montant_total_fcfa: montantTotal,
    statut: STATUT_RESERVATION.EN_ATTENTE,
  });

  await commissionService.creerTransactionPharmacie({
    patientId,
    etablissementId: etablissement_id,
    reservationId: reservation.id,
    montantBrut: montantTotal,
    libelle: `Réservation ${etab.nom}`,
  });

  const full = await ReservationDispensaire.findByPk(reservation.id, {
    include: [
      { model: Etablissement, as: 'etablissement', attributes: ['id', 'nom', 'type', 'ville', 'telephone'] },
      { model: OrdonnanceElectronique, as: 'ordonnance', attributes: ['id', 'numero_unique'] },
    ],
  });

  const formatted = await formatReservation(full);
  return {
    ...formatted,
    commission: commissionService.previewPharmacie(montantTotal),
  };
};

const estimerPanier = (lignes) => commissionService.previewPharmacieLignes(lignes);

const listerPatient = async (patientId) => {
  const rows = await ReservationDispensaire.findAll({
    where: { patient_id: patientId },
    include: [
      { model: Etablissement, as: 'etablissement', attributes: ['id', 'nom', 'type', 'ville', 'telephone', 'adresse'] },
      { model: OrdonnanceElectronique, as: 'ordonnance', attributes: ['id', 'numero_unique'], required: false },
      { model: Ordonnance, as: 'ordonnance_papier', attributes: ['id', 'image_url', 'statut'], required: false },
    ],
    order: [['createdAt', 'DESC']],
    limit: 50,
  });
  return Promise.all(rows.map(formatReservation));
};

const listerEtablissement = async (etablissementId, { statut } = {}) => {
  const where = { etablissement_id: etablissementId };
  if (statut) where.statut = statut;
  const rows = await ReservationDispensaire.findAll({
    where,
    include: [
      { model: Patient, as: 'patient', attributes: ['id', 'nom', 'prenom', 'telephone', 'email'] },
      { model: OrdonnanceElectronique, as: 'ordonnance', attributes: ['id', 'numero_unique'], required: false },
      { model: Ordonnance, as: 'ordonnance_papier', attributes: ['id', 'image_url', 'statut'], required: false },
    ],
    order: [['createdAt', 'DESC']],
    limit: 100,
  });
  return Promise.all(rows.map(formatReservation));
};

const decrementerStock = async (lignesRaw) => {
  const lignes = parseJsonField(lignesRaw, []);
  for (const ligne of lignes) {
    const produit = await ProduitPharmacie.findByPk(ligne.produit_id);
    if (produit) {
      produit.stock_disponible = Math.max(0, produit.stock_disponible - ligne.quantite);
      await produit.save();
    }
  }
};

const mettreAJourStatut = async (etablissementId, reservationId, { statut, reponse_etablissement }) => {
  const reservation = await ReservationDispensaire.findOne({
    where: { id: reservationId, etablissement_id: etablissementId },
  });
  if (!reservation) {
    const error = new Error('Réservation non trouvée');
    error.statusCode = 404;
    throw error;
  }

  const allowed = [STATUT_RESERVATION.CONFIRMEE, STATUT_RESERVATION.REFUSEE, STATUT_RESERVATION.PRETE, STATUT_RESERVATION.RETIREE];
  if (!allowed.includes(statut)) {
    const error = new Error('Statut invalide');
    error.statusCode = 400;
    throw error;
  }

  if (statut === STATUT_RESERVATION.RETIREE && reservation.statut !== STATUT_RESERVATION.RETIREE) {
    await decrementerStock(reservation.lignes);
    if (reservation.ordonnance_electronique_id) {
      const ord = await OrdonnanceElectronique.findByPk(reservation.ordonnance_electronique_id);
      if (ord && ord.statut === STATUT_ORDONNANCE_ELEC.SIGNEE) {
        ord.statut = STATUT_ORDONNANCE_ELEC.DELIVREE;
        await ord.save();
      }
    }
  }

  reservation.statut = statut;
  if (reponse_etablissement !== undefined) reservation.reponse_etablissement = reponse_etablissement;
  await reservation.save();

  return ReservationDispensaire.findByPk(reservation.id, {
    include: [
      { model: Patient, as: 'patient', attributes: ['id', 'nom', 'prenom', 'telephone'] },
    ],
  });
};

const annulerPatient = async (patientId, reservationId) => {
  const cancellationService = require('./cancellation.service');
  const reservation = await ReservationDispensaire.findOne({
    where: { id: reservationId, patient_id: patientId },
  });
  if (!reservation) {
    const error = new Error('Réservation non trouvée');
    error.statusCode = 404;
    throw error;
  }

  const evaluation = await cancellationService.evaluerReservation(reservation);
  if (!evaluation.eligible) {
    const error = new Error(evaluation.message);
    error.statusCode = 400;
    error.details = evaluation;
    throw error;
  }

  reservation.statut = STATUT_RESERVATION.ANNULEE;
  await reservation.save();
  await cancellationService.appliquerRemboursement('reservation_dispensaire', reservationId, evaluation);

  return {
    reservation,
    annulation: evaluation,
  };
};

const previewAnnulationPatient = async (patientId, reservationId) => {
  const reservation = await ReservationDispensaire.findOne({
    where: { id: reservationId, patient_id: patientId },
  });
  if (!reservation) {
    const error = new Error('Réservation non trouvée');
    error.statusCode = 404;
    throw error;
  }
  const cancellationService = require('./cancellation.service');
  return cancellationService.evaluerReservation(reservation);
};

const creerDepuisOrdonnance = async (patientId, ordonnanceId, etablissementId, { message_patient, date_retrait_souhaitee } = {}) => {
  const dispo = await verifierDisponibiliteOrdonnance(patientId, ordonnanceId, etablissementId);
  const lignes = dispo.lignes
    .filter((l) => l.disponible && l.produit)
    .map((l) => ({
      produit_id: l.produit.id,
      nom: l.produit.nom,
      quantite: 1,
    }));

  if (!lignes.length) {
    const error = new Error('Aucun médicament de l\'ordonnance n\'est disponible dans cet établissement');
    error.statusCode = 400;
    throw error;
  }

  return creer(patientId, {
    etablissement_id: etablissementId,
    lignes,
    message_patient: message_patient || `Réservation depuis ordonnance ${dispo.ordonnance.numero_unique}`,
    ordonnance_electronique_id: ordonnanceId,
    date_retrait_souhaitee,
  });
};

const verifierDisponibiliteOrdonnance = async (patientId, ordonnanceId, etablissementId) => {
  const ord = await OrdonnanceElectronique.findOne({
    where: { id: ordonnanceId, patient_id: patientId, statut: STATUT_ORDONNANCE_ELEC.SIGNEE },
    include: [{ association: 'medecin', attributes: ['id', 'nom', 'prenom', 'etablissement_id'] }],
  });
  if (!ord) {
    const error = new Error('Ordonnance non trouvée ou non signée');
    error.statusCode = 404;
    throw error;
  }

  const etab = await Etablissement.findByPk(etablissementId);
  if (!etab) {
    const error = new Error('Établissement non trouvé');
    error.statusCode = 404;
    throw error;
  }

  const produits = await ProduitPharmacie.findAll({
    where: { pharmacie_id: etablissementId, actif: true },
  });

  const medicaments = Array.isArray(ord.medicaments) ? ord.medicaments : [];
  const lignes = medicaments.map((med) => {
    const nom = med.nom || med.dci || med.medicament || String(med);
    const produit = trouverProduit(nom, produits);
    return {
      medicament_ordonnance: med,
      nom_recherche: nom,
      disponible: !!(produit && produit.stock_disponible > 0),
      produit: produit ? {
        id: produit.id,
        nom: produit.nom,
        prix_fcfa: produit.prix_fcfa,
        stock_disponible: produit.stock_disponible,
        necessite_ordonnance: produit.necessite_ordonnance,
        image_url: produit.fichier_image_id ? `/api/fichiers/${produit.fichier_image_id}` : null,
      } : null,
    };
  });

  const nbDisponibles = lignes.filter((l) => l.disponible).length;

  return {
    ordonnance: {
      id: ord.id,
      numero_unique: ord.numero_unique,
      diagnostic: ord.diagnostic,
      medicaments: ord.medicaments,
    },
    etablissement: { id: etab.id, nom: etab.nom, type: etab.type, ville: etab.ville },
    lignes,
    resume: {
      total: lignes.length,
      disponibles: nbDisponibles,
      partiel: nbDisponibles > 0 && nbDisponibles < lignes.length,
      complet: nbDisponibles === lignes.length && lignes.length > 0,
    },
  };
};

module.exports = {
  creer,
  estimerPanier,
  listerPatient,
  listerEtablissement,
  mettreAJourStatut,
  annulerPatient,
  previewAnnulationPatient,
  creerDepuisOrdonnance,
  verifierDisponibiliteOrdonnance,
  trouverProduit,
};
