const { Transaction, Patient, RendezVous, ReservationDispensaire } = require('../models');
const {
  calculerConsultation, calculerPharmacie, getTarifsPublics, roundFcfa,
} = require('../config/commissions');

const formatBreakdown = (calc, extra = {}) => ({
  ...calc,
  ...extra,
});

const creerTransactionConsultation = async ({
  patientId, medecinId, rendezVousId, tarifFcfa, libelle,
}) => {
  const calc = calculerConsultation(tarifFcfa || 0);

  const existing = await Transaction.findOne({
    where: { reference_type: 'rendez_vous', reference_id: rendezVousId },
  });
  if (existing) return existing;

  return Transaction.create({
    type: 'consultation',
    statut_paiement: calc.montant_brut_fcfa > 0 ? 'en_attente' : 'paye',
    montant_brut_fcfa: calc.montant_brut_fcfa,
    commission_fcfa: calc.commission_fcfa,
    montant_net_fcfa: calc.montant_net_fcfa,
    taux_commission: calc.taux_commission,
    patient_id: patientId,
    beneficiaire_type: 'medecin',
    beneficiaire_id: medecinId,
    reference_type: 'rendez_vous',
    reference_id: rendezVousId,
    libelle: libelle || 'Consultation médicale',
  });
};

const creerTransactionPharmacie = async ({
  patientId, etablissementId, reservationId, montantBrut, libelle,
}) => {
  const calc = calculerPharmacie(montantBrut);

  const existing = await Transaction.findOne({
    where: { reference_type: 'reservation_dispensaire', reference_id: reservationId },
  });
  if (existing) return existing;

  return Transaction.create({
    type: 'pharmacie',
    statut_paiement: calc.montant_brut_fcfa > 0 ? 'en_attente' : 'paye',
    montant_brut_fcfa: calc.montant_brut_fcfa,
    commission_fcfa: calc.commission_fcfa,
    montant_net_fcfa: calc.montant_net_fcfa,
    taux_commission: calc.taux_commission,
    patient_id: patientId,
    beneficiaire_type: 'etablissement',
    beneficiaire_id: etablissementId,
    reference_type: 'reservation_dispensaire',
    reference_id: reservationId,
    libelle: libelle || 'Réservation pharmacie',
  });
};

const previewConsultation = (tarifFcfa) => formatBreakdown(calculerConsultation(tarifFcfa || 0), {
  type: 'consultation',
});

const previewPharmacie = (montantBrut) => formatBreakdown(calculerPharmacie(montantBrut || 0), {
  type: 'pharmacie',
});

const previewPharmacieLignes = (lignes = []) => {
  const brut = lignes.reduce(
    (sum, l) => sum + roundFcfa(l.prix_fcfa_unitaire) * (parseInt(l.quantite, 10) || 1),
    0,
  );
  return previewPharmacie(brut);
};

const getTransactionByReference = async (referenceType, referenceId) => {
  const tx = await Transaction.findOne({
    where: { reference_type: referenceType, reference_id: referenceId },
  });
  return tx;
};

const annulerTransaction = async (referenceType, referenceId) => {
  const tx = await getTransactionByReference(referenceType, referenceId);
  if (tx && tx.statut_paiement === 'en_attente') {
    tx.statut_paiement = 'annule';
    await tx.save();
  }
  return tx;
};

const resumeAdmin = async () => {
  const { Op } = require('sequelize');
  const reversementService = require('./reversement.service');
  const txs = await Transaction.findAll({
    where: { statut_paiement: { [Op.ne]: 'annule' } },
    attributes: [
      'type', 'commission_fcfa', 'montant_brut_fcfa', 'montant_net_fcfa',
      'statut_paiement', 'statut_reversement', 'canal_paiement', 'provider',
    ],
  });

  const resume = {
    total_commissions_fcfa: 0,
    total_volume_fcfa: 0,
    total_net_reverse_fcfa: 0,
    par_type: { consultation: { count: 0, commission: 0, volume: 0 }, pharmacie: { count: 0, commission: 0, volume: 0 } },
    paiements: { en_attente: 0, paye: 0 },
    reversements: { en_attente: 0, reverse: 0, echec: 0, total_reverse_fcfa: 0 },
  };

  txs.forEach((t) => {
    resume.total_commissions_fcfa += t.commission_fcfa;
    resume.total_volume_fcfa += t.montant_brut_fcfa;
    if (resume.par_type[t.type]) {
      resume.par_type[t.type].count += 1;
      resume.par_type[t.type].commission += t.commission_fcfa;
      resume.par_type[t.type].volume += t.montant_brut_fcfa;
    }
    if (t.statut_paiement === 'en_attente') resume.paiements.en_attente += 1;
    if (t.statut_paiement === 'paye') resume.paiements.paye += 1;
    if (t.statut_paiement === 'paye' && t.montant_net_fcfa > 0) {
      if (t.statut_reversement === 'reverse') {
        resume.reversements.reverse += 1;
        resume.reversements.total_reverse_fcfa += t.montant_net_fcfa;
      } else if (t.statut_reversement === 'echec') resume.reversements.echec += 1;
      else resume.reversements.en_attente += 1;
    }
  });

  resume.total_net_reverse_fcfa = resume.reversements.total_reverse_fcfa;
  return resume;
};

const listerTransactionsAdmin = async ({ page = 1, limit = 30, statut_paiement, statut_reversement } = {}) => {
  const { Op } = require('sequelize');
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 30));
  const where = { statut_paiement: { [Op.ne]: 'annule' } };
  if (statut_paiement) where.statut_paiement = statut_paiement;
  if (statut_reversement) where.statut_reversement = statut_reversement;

  const offset = (safePage - 1) * safeLimit;
  const { rows, count } = await Transaction.findAndCountAll({
    where,
    include: [
      { model: Patient, as: 'patient', attributes: ['id', 'nom', 'prenom', 'email'] },
    ],
    order: [['createdAt', 'DESC']],
    limit: safeLimit,
    offset,
  });

  const paiementService = require('./paiement.service');
  const reversementService = require('./reversement.service');

  const transactions = await Promise.all(rows.map(async (tx) => {
    const formatted = paiementService.formatTransaction(tx);
    const { label } = await reversementService.getBeneficiaire(tx);
    return {
      ...formatted,
      patient: tx.patient ? { nom: tx.patient.nom, prenom: tx.patient.prenom, email: tx.patient.email } : null,
      beneficiaire_label: label,
    };
  }));

  return { transactions, pagination: { total: count, page: safePage, limit: safeLimit } };
};

module.exports = {
  getTarifsPublics,
  previewConsultation,
  previewPharmacie,
  previewPharmacieLignes,
  creerTransactionConsultation,
  creerTransactionPharmacie,
  getTransactionByReference,
  annulerTransaction,
  resumeAdmin,
  listerTransactionsAdmin,
};
