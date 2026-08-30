/** Version courante de la politique de confidentialité (incrémenter à chaque mise à jour majeure). */
const POLITIQUE_CONFIDENTIALITE_VERSION = '1.0.0';

const DPO_CONTACT = {
  email: process.env.DPO_EMAIL || 'dpo@djamsante.cm',
  telephone: process.env.DPO_PHONE || '+237 6XX XX XX XX',
  adresse: process.env.DPO_ADDRESS || 'Ministère de la Santé Publique, Yaoundé, Cameroun',
};

module.exports = {
  POLITIQUE_CONFIDENTIALITE_VERSION,
  DPO_CONTACT,
};
