/** Configuration CinetPay — Cameroun / zone CEMAC */

const CINETPAY_API_URL = process.env.CINETPAY_API_URL || 'https://api-checkout.cinetpay.com/v2/payment';
const CINETPAY_CHECK_URL = process.env.CINETPAY_CHECK_URL || 'https://api-checkout.cinetpay.com/v2/payment/check';

const isCinetPayConfigured = () => Boolean(
  process.env.CINETPAY_API_KEY
  && process.env.CINETPAY_SITE_ID
  && process.env.CINETPAY_ENABLED !== 'false',
);

const getNotifyUrl = () => {
  const base = process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 3000}`;
  return `${base.replace(/\/$/, '')}/api/paiements/cinetpay/notify`;
};

const getReturnUrl = (transactionId) => {
  const front = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
  return `${front}/paiement/retour?transaction=${transactionId}`;
};

module.exports = {
  CINETPAY_API_URL,
  CINETPAY_CHECK_URL,
  isCinetPayConfigured,
  getNotifyUrl,
  getReturnUrl,
};
