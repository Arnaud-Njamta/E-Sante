/** Taux de commission DjamSanté (configurables via .env) */

const CONSULTATION_RATE = parseFloat(process.env.COMMISSION_CONSULTATION_RATE || '0.10');
const PHARMACIE_RATE = parseFloat(process.env.COMMISSION_PHARMACIE_RATE || '0.05');

const roundFcfa = (n) => Math.round(Number(n) || 0);

const calculerCommission = (montantBrut, taux) => {
  const brut = roundFcfa(montantBrut);
  const commission = roundFcfa(brut * taux);
  const net = Math.max(0, brut - commission);
  return {
    montant_brut_fcfa: brut,
    taux_commission: taux,
    commission_fcfa: commission,
    montant_net_fcfa: net,
    montant_total_patient_fcfa: brut,
  };
};

const calculerConsultation = (tarifFcfa) => calculerCommission(tarifFcfa, CONSULTATION_RATE);

const calculerPharmacie = (montantPanier) => calculerCommission(montantPanier, PHARMACIE_RATE);

const getTarifsPublics = () => ({
  consultation: {
    label: 'Consultation (présentiel & téléconsultation)',
    taux_pourcent: Math.round(CONSULTATION_RATE * 100),
    description: 'Commission prélevée sur le tarif de consultation du médecin.',
  },
  pharmacie: {
    label: 'Réservation / achat pharmacie',
    taux_pourcent: Math.round(PHARMACIE_RATE * 100),
    description: 'Commission prélevée sur le montant des médicaments réservés.',
  },
  mode_paiement_actuel: process.env.CINETPAY_API_KEY ? 'cinetpay' : 'simulation',
  note: 'Paiement Mobile Money (Orange / MTN) via CinetPay. En local, mode simulation activé.',
});

module.exports = {
  CONSULTATION_RATE,
  PHARMACIE_RATE,
  calculerCommission,
  calculerConsultation,
  calculerPharmacie,
  getTarifsPublics,
  roundFcfa,
};
