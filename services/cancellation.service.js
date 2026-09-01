const commissionService = require('./commission.service');
const paiementService = require('./paiement.service');
const {
  RESERVATION_STATUTS,
  RDV_STATUTS,
  RESERVATION_CONFIRMEE_PALIERS,
  RDV_CONFIRME_PALIERS,
  pickPalier,
  hoursUntil,
  reservationPickupDate,
  rdvDateTime,
} = require('../config/cancellation-policy');

const roundFcfa = (n) => Math.max(0, Math.round(Number(n) || 0));

const buildRefund = (tx, percent) => {
  const montantBrut = Number(tx?.montant_brut_fcfa) || 0;
  const statut = tx?.statut_paiement;
  if (!tx || montantBrut <= 0) {
    return {
      paye: false,
      refund_percent: 100,
      refund_fcfa: 0,
      montant_brut_fcfa: 0,
      message_paiement: 'Aucun paiement enregistré — annulation sans frais.',
    };
  }
  if (statut === 'en_attente') {
    return {
      paye: false,
      refund_percent: 100,
      refund_fcfa: 0,
      montant_brut_fcfa: montantBrut,
      message_paiement: 'Paiement en attente — aucun débit, annulation gratuite.',
    };
  }
  if (statut === 'paye') {
    const refundFcfa = roundFcfa((montantBrut * percent) / 100);
    return {
      paye: true,
      refund_percent: percent,
      refund_fcfa: refundFcfa,
      montant_brut_fcfa: montantBrut,
      frais_retenus_fcfa: montantBrut - refundFcfa,
      message_paiement: refundFcfa > 0
        ? `Remboursement de ${refundFcfa.toLocaleString('fr-FR')} FCFA (${percent} % du montant payé).`
        : 'Aucun remboursement — délai d\'annulation dépassé.',
    };
  }
  if (statut === 'rembourse') {
    return {
      paye: true,
      refund_percent: 0,
      refund_fcfa: 0,
      montant_brut_fcfa: montantBrut,
      message_paiement: 'Cette transaction a déjà été remboursée.',
    };
  }
  return {
    paye: false,
    refund_percent: percent,
    refund_fcfa: 0,
    montant_brut_fcfa: montantBrut,
    message_paiement: 'Transaction annulée ou inactive.',
  };
};

const evaluerReservation = async (reservation) => {
  const tx = await commissionService.getTransactionByReference('reservation_dispensaire', reservation.id);

  if (RESERVATION_STATUTS.BLOQUES.includes(reservation.statut)) {
    return {
      eligible: false,
      type: 'reservation',
      statut: reservation.statut,
      refund_percent: 0,
      refund_fcfa: 0,
      message: 'Cette réservation ne peut plus être annulée (commande prête, retirée ou déjà annulée).',
      conditions: [],
      transaction: paiementService.formatTransaction(tx),
    };
  }

  if (!RESERVATION_STATUTS.ANNULABLES.includes(reservation.statut)) {
    return {
      eligible: false,
      type: 'reservation',
      statut: reservation.statut,
      refund_percent: 0,
      refund_fcfa: 0,
      message: 'Annulation impossible pour ce statut.',
      conditions: [],
      transaction: paiementService.formatTransaction(tx),
    };
  }

  if (reservation.statut === 'en_attente') {
    const refund = buildRefund(tx, 100);
    return {
      eligible: true,
      type: 'reservation',
      statut: reservation.statut,
      ...refund,
      message: 'Annulation gratuite tant que la pharmacie n\'a pas préparé votre commande.',
      palier: { label: 'En attente de validation', percent: 100 },
      conditions: [
        'La pharmacie n\'a pas encore validé votre demande.',
        'Vous pouvez annuler à tout moment sans frais.',
      ],
      transaction: paiementService.formatTransaction(tx),
    };
  }

  const pickup = reservationPickupDate(reservation);
  const hours = hoursUntil(pickup);
  const palier = pickPalier(RESERVATION_CONFIRMEE_PALIERS, hours);
  const refund = buildRefund(tx, palier.percent);

  if (palier.block) {
    return {
      eligible: false,
      type: 'reservation',
      statut: reservation.statut,
      hours_remaining: Math.max(0, Math.round(hours * 10) / 10),
      palier,
      ...refund,
      message: `Annulation impossible : moins de 4 h avant le retrait prévu (${pickup.toLocaleDateString('fr-FR')}). Contactez la pharmacie.`,
      conditions: RESERVATION_CONFIRMEE_PALIERS.map((p) => `${p.label} → ${p.percent} % remboursé`),
      transaction: paiementService.formatTransaction(tx),
    };
  }

  return {
    eligible: true,
    type: 'reservation',
    statut: reservation.statut,
    hours_remaining: Math.max(0, Math.round(hours * 10) / 10),
    date_reference: pickup.toISOString(),
    palier,
    ...refund,
    message: `${palier.label} : remboursement à ${palier.percent} %.`,
    conditions: RESERVATION_CONFIRMEE_PALIERS.filter((p) => !p.block).map((p) => `${p.label} → ${p.percent} %`),
    transaction: paiementService.formatTransaction(tx),
  };
};

const evaluerRdv = async (rdv) => {
  const tx = await commissionService.getTransactionByReference('rendez_vous', rdv.id);

  if (RDV_STATUTS.BLOQUES.includes(rdv.statut)) {
    return {
      eligible: false,
      type: 'rendez_vous',
      statut: rdv.statut,
      refund_percent: 0,
      refund_fcfa: 0,
      message: 'Ce rendez-vous ne peut plus être annulé.',
      conditions: [],
      transaction: paiementService.formatTransaction(tx),
    };
  }

  if (!RDV_STATUTS.ANNULABLES.includes(rdv.statut)) {
    return {
      eligible: false,
      type: 'rendez_vous',
      statut: rdv.statut,
      refund_percent: 0,
      refund_fcfa: 0,
      message: 'Annulation impossible pour ce statut.',
      conditions: [],
      transaction: paiementService.formatTransaction(tx),
    };
  }

  if (['en_attente', 'contre_proposition'].includes(rdv.statut)) {
    const refund = buildRefund(tx, 100);
    return {
      eligible: true,
      type: 'rendez_vous',
      statut: rdv.statut,
      ...refund,
      message: rdv.statut === 'contre_proposition'
        ? 'Refus de la contre-proposition — annulation sans frais.'
        : 'Annulation gratuite tant que le médecin n\'a pas confirmé le créneau.',
      palier: { label: 'En attente de confirmation', percent: 100 },
      conditions: [
        'Le médecin n\'a pas encore confirmé ce créneau.',
        'Remboursement intégral si vous aviez déjà payé.',
      ],
      transaction: paiementService.formatTransaction(tx),
    };
  }

  const rdvDt = rdvDateTime(rdv);
  const hours = hoursUntil(rdvDt);
  const palier = pickPalier(RDV_CONFIRME_PALIERS, hours);
  const refund = buildRefund(tx, palier.percent);

  if (palier.block) {
    return {
      eligible: false,
      type: 'rendez_vous',
      statut: rdv.statut,
      hours_remaining: Math.max(0, Math.round(hours * 10) / 10),
      date_rdv: rdv.date_rdv,
      heure_debut: rdv.heure_debut,
      palier,
      ...refund,
      message: `Annulation impossible : moins de 2 h avant la consultation (${rdv.date_rdv} à ${rdv.heure_debut}). Contactez le cabinet.`,
      conditions: RDV_CONFIRME_PALIERS.map((p) => `${p.label} → ${p.percent} % remboursé`),
      transaction: paiementService.formatTransaction(tx),
    };
  }

  return {
    eligible: true,
    type: 'rendez_vous',
    statut: rdv.statut,
    hours_remaining: Math.max(0, Math.round(hours * 10) / 10),
    date_rdv: rdv.date_rdv,
    heure_debut: rdv.heure_debut,
    palier,
    ...refund,
    message: `${palier.label} : remboursement à ${palier.percent} %.`,
    conditions: RDV_CONFIRME_PALIERS.filter((p) => !p.block).map((p) => `${p.label} → ${p.percent} %`),
    transaction: paiementService.formatTransaction(tx),
  };
};

const appliquerRemboursement = async (referenceType, referenceId, evaluation) => {
  const tx = await commissionService.getTransactionByReference(referenceType, referenceId);
  if (!tx) return null;

  if (tx.statut_paiement === 'en_attente') {
    tx.statut_paiement = 'annule';
    await tx.save();
    return paiementService.formatTransaction(tx);
  }

  if (tx.statut_paiement === 'paye') {
    const montant = evaluation.refund_fcfa || 0;
    if (montant > 0) {
      return paiementService.rembourserTransaction(tx, montant, {
        pourcent: evaluation.refund_percent,
        motif: 'annulation_patient',
        politique: evaluation.palier?.label,
      });
    }
    tx.metadonnees_paiement = {
      ...(tx.metadonnees_paiement || {}),
      annulation_sans_remboursement: {
        date: new Date().toISOString(),
        pourcent: 0,
        motif: 'delai_depasse',
      },
    };
    tx.statut_paiement = 'annule';
    await tx.save();
    return paiementService.formatTransaction(tx);
  }

  return paiementService.formatTransaction(tx);
};

module.exports = {
  evaluerReservation,
  evaluerRdv,
  appliquerRemboursement,
  buildRefund,
};
