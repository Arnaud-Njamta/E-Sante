const crypto = require('crypto');
const { Transaction, Patient, Medecin, Etablissement } = require('../models');
const commissionService = require('./commission.service');
const reversementService = require('./reversement.service');
const {
  CINETPAY_API_URL, CINETPAY_CHECK_URL, isCinetPayConfigured, getNotifyUrl, getReturnUrl,
} = require('../config/cinetpay');

const genererReferencePaiement = () => `MS-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

const formatTransaction = (tx) => {
  if (!tx) return null;
  const j = tx.toJSON ? tx.toJSON() : tx;
  return {
    id: j.id,
    type: j.type,
    statut_paiement: j.statut_paiement,
    montant_brut_fcfa: j.montant_brut_fcfa,
    commission_fcfa: j.commission_fcfa,
    montant_net_fcfa: j.montant_net_fcfa,
    libelle: j.libelle,
    reference_paiement: j.reference_paiement,
    provider: j.provider,
    canal_paiement: j.canal_paiement,
    paye_le: j.paye_le,
    reference_type: j.reference_type,
    reference_id: j.reference_id,
    beneficiaire_type: j.beneficiaire_type,
    beneficiaire_id: j.beneficiaire_id,
    statut_reversement: j.statut_reversement,
    reverse_le: j.reverse_le,
    reference_reversement: j.reference_reversement,
    createdAt: j.createdAt,
  };
};

const getTransactionPatient = async (patientId, referenceType, referenceId) => {
  const tx = await commissionService.getTransactionByReference(referenceType, referenceId);
  if (!tx || tx.patient_id !== patientId) return null;
  return tx;
};

const marquerPaye = async (tx, { canal, provider, metadonnees = {} }) => {
  if (tx.statut_paiement === 'paye') return tx;
  tx.statut_paiement = 'paye';
  tx.paye_le = new Date();
  tx.provider = provider || tx.provider || 'simulation';
  if (canal) tx.canal_paiement = canal;
  tx.metadonnees_paiement = { ...(tx.metadonnees_paiement || {}), ...metadonnees };
  await tx.save();
  if (tx.montant_net_fcfa > 0) {
    tx.statut_reversement = 'en_attente';
    await tx.save();
    await reversementService.declencherReversement(tx.id);
    await tx.reload();
  } else {
    tx.statut_reversement = 'non_applicable';
    await tx.save();
  }
  return tx;
};

const appelerCinetPay = async (url, body) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || (data.code && !['00', '201'].includes(String(data.code)))) {
    const error = new Error(data.message || data.description || 'Erreur CinetPay');
    error.statusCode = 502;
    error.details = data;
    throw error;
  }
  return data;
};

const initierCinetPay = async (tx, patient) => {
  const reference = tx.reference_paiement || genererReferencePaiement();
  tx.reference_paiement = reference;
  tx.provider = 'cinetpay';
  await tx.save();

  const payload = {
    apikey: process.env.CINETPAY_API_KEY,
    site_id: process.env.CINETPAY_SITE_ID,
    transaction_id: reference,
    amount: tx.montant_brut_fcfa,
    currency: 'XAF',
    description: tx.libelle || 'Paiement DjamSanté',
    notify_url: getNotifyUrl(),
    return_url: getReturnUrl(tx.id),
    channels: 'ALL',
    customer_name: patient.prenom || 'Patient',
    customer_surname: patient.nom || 'DjamSanté',
    customer_email: patient.email,
    customer_phone_number: patient.telephone || '+237600000000',
    customer_address: patient.ville || 'Yaoundé',
    customer_city: patient.ville || 'Yaoundé',
    customer_country: 'CM',
    customer_state: 'CM',
    customer_zip_code: '00000',
  };

  const result = await appelerCinetPay(CINETPAY_API_URL, payload);
  const paymentUrl = result.data?.payment_url || result.data?.checkout_url;

  return {
    mode: 'cinetpay',
    transaction: formatTransaction(tx),
    payment_url: paymentUrl,
    reference_paiement: reference,
  };
};

const initierSimulation = async (tx, canal) => {
  if (!tx.reference_paiement) {
    tx.reference_paiement = genererReferencePaiement();
  }
  tx.provider = 'simulation';
  if (canal) tx.canal_paiement = canal;
  await tx.save();

  return {
    mode: 'simulation',
    transaction: formatTransaction(tx),
    message: 'Mode démo : confirmez le paiement pour simuler Orange Money / MTN MoMo.',
  };
};

const initierPaiement = async (patientId, { reference_type, reference_id, canal }) => {
  const tx = await getTransactionPatient(patientId, reference_type, reference_id);
  if (!tx) {
    const error = new Error('Transaction introuvable');
    error.statusCode = 404;
    throw error;
  }
  if (tx.statut_paiement === 'paye') {
    const error = new Error('Cette transaction est déjà payée');
    error.statusCode = 400;
    throw error;
  }
  if (tx.statut_paiement === 'annule') {
    const error = new Error('Cette transaction est annulée');
    error.statusCode = 400;
    throw error;
  }
  if (tx.montant_brut_fcfa <= 0) {
    await marquerPaye(tx, { provider: 'simulation', canal: 'gratuit' });
    return { mode: 'gratuit', transaction: formatTransaction(tx) };
  }

  const patient = await Patient.findByPk(patientId, {
    attributes: ['id', 'nom', 'prenom', 'email', 'telephone'],
  });

  if (isCinetPayConfigured()) {
    return initierCinetPay(tx, patient);
  }
  return initierSimulation(tx, canal);
};

const simulerPaiement = async (patientId, transactionId, { canal = 'orange_money' } = {}) => {
  if (isCinetPayConfigured() && process.env.NODE_ENV === 'production') {
    const error = new Error('Simulation désactivée en production avec CinetPay');
    error.statusCode = 403;
    throw error;
  }

  const tx = await Transaction.findOne({ where: { id: transactionId, patient_id: patientId } });
  if (!tx) {
    const error = new Error('Transaction introuvable');
    error.statusCode = 404;
    throw error;
  }
  if (tx.statut_paiement === 'paye') {
    return { transaction: formatTransaction(tx), deja_paye: true };
  }

  await marquerPaye(tx, {
    canal,
    provider: 'simulation',
    metadonnees: { simule: true, date: new Date().toISOString() },
  });

  return { transaction: formatTransaction(tx), message: 'Paiement simulé avec succès' };
};

const verifierCinetPay = async (referencePaiement) => {
  const result = await appelerCinetPay(CINETPAY_CHECK_URL, {
    apikey: process.env.CINETPAY_API_KEY,
    site_id: process.env.CINETPAY_SITE_ID,
    transaction_id: referencePaiement,
  });
  return result.data || result;
};

const traiterNotificationCinetPay = async (body = {}) => {
  const reference = body.cpm_trans_id || body.transaction_id;
  if (!reference) {
    const error = new Error('Référence paiement manquante');
    error.statusCode = 400;
    throw error;
  }

  const tx = await Transaction.findOne({ where: { reference_paiement: reference } });
  if (!tx) {
    const error = new Error('Transaction DjamSanté introuvable');
    error.statusCode = 404;
    throw error;
  }

  if (tx.statut_paiement === 'paye') {
    return { transaction: formatTransaction(tx), deja_paye: true };
  }

  let statut = body.cpm_result || body.cpm_trans_status;
  if (isCinetPayConfigured()) {
    try {
      const check = await verifierCinetPay(reference);
      statut = check.status || statut;
    } catch {
      // fallback sur le corps de la notification
    }
  }

  const accepte = ['00', 'ACCEPTED', 'SUCCES', 'SUCCESS', 'COMPLETED'].includes(String(statut).toUpperCase())
    || String(body.cpm_error_message || '').toUpperCase() === 'SUCCES';

  if (accepte) {
    await marquerPaye(tx, {
      canal: body.payment_method || body.cellular_name || 'mobile_money',
      provider: 'cinetpay',
      metadonnees: body,
    });
  }

  return { transaction: formatTransaction(tx), accepte };
};

const getStatut = async (patientId, transactionId) => {
  const tx = await Transaction.findOne({ where: { id: transactionId, patient_id: patientId } });
  if (!tx) {
    const error = new Error('Transaction introuvable');
    error.statusCode = 404;
    throw error;
  }

  if (tx.statut_paiement !== 'paye' && tx.provider === 'cinetpay' && tx.reference_paiement && isCinetPayConfigured()) {
    try {
      const check = await verifierCinetPay(tx.reference_paiement);
      if (['ACCEPTED', '00'].includes(String(check.status))) {
        await marquerPaye(tx, { canal: check.payment_method, provider: 'cinetpay', metadonnees: check });
      }
    } catch {
      // ignore check errors
    }
  }

  return formatTransaction(tx);
};

const listerPatient = async (patientId) => {
  const txs = await Transaction.findAll({
    where: { patient_id: patientId },
    order: [['createdAt', 'DESC']],
    limit: 50,
  });
  return txs.map(formatTransaction);
};

const enrichirAvecBeneficiaire = async (txFormatted) => {
  if (!txFormatted) return null;
  let beneficiaire = null;
  if (txFormatted.beneficiaire_type === 'medecin') {
    const m = await Medecin.findByPk(txFormatted.beneficiaire_id, { attributes: ['prenom', 'nom', 'specialite'] });
    beneficiaire = m ? { label: `Dr. ${m.prenom} ${m.nom}`, specialite: m.specialite } : null;
  } else {
    const e = await Etablissement.findByPk(txFormatted.beneficiaire_id, { attributes: ['nom', 'ville', 'type'] });
    beneficiaire = e ? { label: e.nom, ville: e.ville, type: e.type } : null;
  }
  return { ...txFormatted, beneficiaire };
};

module.exports = {
  initierPaiement,
  simulerPaiement,
  traiterNotificationCinetPay,
  getStatut,
  listerPatient,
  getTransactionPatient,
  formatTransaction,
  enrichirAvecBeneficiaire,
};
