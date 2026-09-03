/** Opérateurs Mobile Money acceptés au Cameroun */

const OPERATEURS_MOBILE_MONEY = [
  { id: 'orange_money', label: 'Orange Money' },
  { id: 'mtn_momo', label: 'MTN MoMo' },
  { id: 'wave', label: 'Wave' },
];

const normalizeNumeroCm = (raw) => {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.startsWith('237') && digits.length === 12) return `+${digits}`;
  if (digits.length === 9 && /^6/.test(digits)) return `+237${digits}`;
  if (digits.length === 12) return `+${digits}`;
  return String(raw || '').trim();
};

/**
 * @param {object} paiement
 * @param {{ required?: boolean }} options — required=false pour FR (Mobile Money optionnel)
 */
const validerCoordonneesPaiement = (paiement = {}, { required = true } = {}) => {
  const operateur = paiement.operateur || paiement.operateur_mobile;
  const numeroRaw = paiement.numero || paiement.numero_mobile_money;
  const numero = normalizeNumeroCm(numeroRaw);
  const titulaire = (paiement.titulaire || paiement.titulaire_compte || '').trim();
  const hasAny = !!(operateur || String(numeroRaw || '').trim() || titulaire);

  // Sans numéro / titulaire : pas de coordonnées (ignore un opérateur seul)
  if (!required && (!String(numeroRaw || '').trim() || !titulaire)) {
    return null;
  }

  if (!required && !hasAny) {
    return null;
  }

  if (!operateur) {
    const error = new Error('Sélectionnez un opérateur Mobile Money');
    error.statusCode = 400;
    throw error;
  }
  if (!OPERATEURS_MOBILE_MONEY.some((o) => o.id === operateur)) {
    const error = new Error('Opérateur Mobile Money non reconnu');
    error.statusCode = 400;
    throw error;
  }
  if (!numero || numero.replace(/\D/g, '').length < 9) {
    const error = new Error('Numéro Mobile Money invalide (ex. +237 6XX XX XX XX)');
    error.statusCode = 400;
    throw error;
  }
  if (!titulaire || titulaire.length < 2) {
    const error = new Error('Indiquez le titulaire du compte Mobile Money');
    error.statusCode = 400;
    throw error;
  }

  return {
    operateur,
    numero,
    titulaire,
    numero_marchand: (paiement.numero_marchand || '').trim() || null,
    verifie: false,
    enregistre_le: new Date().toISOString(),
  };
};

module.exports = {
  OPERATEURS_MOBILE_MONEY,
  normalizeNumeroCm,
  validerCoordonneesPaiement,
};
