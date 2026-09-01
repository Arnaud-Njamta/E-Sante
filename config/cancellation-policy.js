/**
 * Politiques d'annulation patient — remboursements partiels selon délai.
 * Montants calculés sur le montant brut payé (FCFA).
 */

const RESERVATION_STATUTS = {
  ANNULABLES: ['en_attente', 'confirmee'],
  BLOQUES: ['prete', 'retiree', 'refusee', 'annulee'],
};

const RDV_STATUTS = {
  ANNULABLES: ['en_attente', 'confirme', 'contre_proposition'],
  BLOQUES: ['annule', 'termine', 'absent'],
};

/** Paliers remboursement réservation confirmée (heures avant retrait souhaité ou création + 48h) */
const RESERVATION_CONFIRMEE_PALIERS = [
  { minHours: 24, percent: 100, label: 'Plus de 24 h avant le retrait' },
  { minHours: 12, percent: 50, label: 'Entre 12 h et 24 h avant le retrait' },
  { minHours: 4, percent: 25, label: 'Entre 4 h et 12 h avant le retrait' },
  { minHours: 0, percent: 0, label: 'Moins de 4 h avant le retrait', block: true },
];

/** Paliers remboursement consultation confirmée (heures avant le RDV) */
const RDV_CONFIRME_PALIERS = [
  { minHours: 48, percent: 100, label: 'Plus de 48 h avant la consultation' },
  { minHours: 24, percent: 75, label: 'Entre 24 h et 48 h avant la consultation' },
  { minHours: 6, percent: 50, label: 'Entre 6 h et 24 h avant la consultation' },
  { minHours: 2, percent: 25, label: 'Entre 2 h et 6 h avant la consultation' },
  { minHours: 0, percent: 0, label: 'Moins de 2 h avant la consultation', block: true },
];

const pickPalier = (paliers, hoursRemaining) => {
  const sorted = [...paliers].sort((a, b) => b.minHours - a.minHours);
  return sorted.find((p) => hoursRemaining >= p.minHours) || sorted[sorted.length - 1];
};

const hoursUntil = (targetDate) => {
  if (!targetDate) return null;
  const ms = new Date(targetDate).getTime() - Date.now();
  return ms / (1000 * 60 * 60);
};

const reservationPickupDate = (reservation) => {
  if (reservation.date_retrait_souhaitee) {
    return new Date(`${reservation.date_retrait_souhaitee}T12:00:00`);
  }
  const base = reservation.updatedAt || reservation.createdAt;
  const d = new Date(base);
  d.setHours(d.getHours() + 48);
  return d;
};

const rdvDateTime = (rdv) => {
  const h = (rdv.heure_debut || '09:00').slice(0, 5);
  return new Date(`${rdv.date_rdv}T${h}:00`);
};

module.exports = {
  RESERVATION_STATUTS,
  RDV_STATUTS,
  RESERVATION_CONFIRMEE_PALIERS,
  RDV_CONFIRME_PALIERS,
  pickPalier,
  hoursUntil,
  reservationPickupDate,
  rdvDateTime,
};
