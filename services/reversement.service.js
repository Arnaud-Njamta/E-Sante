const crypto = require('crypto');
const { Op } = require('sequelize');
const { Transaction, Medecin, Etablissement } = require('../models');
const { isCinetPayConfigured } = require('../config/cinetpay');

const getBeneficiaire = async (tx) => {
  if (tx.beneficiaire_type === 'medecin') {
    const m = await Medecin.findByPk(tx.beneficiaire_id, {
      attributes: ['id', 'nom', 'prenom', 'coordonnees_paiement'],
    });
    return {
      label: m ? `Dr. ${m.prenom} ${m.nom}` : 'Médecin',
      coordonnees: m?.coordonnees_paiement || null,
    };
  }
  const e = await Etablissement.findByPk(tx.beneficiaire_id, {
    attributes: ['id', 'nom', 'coordonnees_paiement'],
  });
  return { label: e?.nom || 'Établissement', coordonnees: e?.coordonnees_paiement || null };
};

const genererRefReversement = () => `REV-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

const declencherReversement = async (transactionId, { force = false } = {}) => {
  const tx = await Transaction.findByPk(transactionId);
  if (!tx || tx.statut_paiement !== 'paye') return tx;
  if (tx.statut_reversement === 'reverse' && !force) return tx;

  if (tx.montant_net_fcfa <= 0) {
    tx.statut_reversement = 'non_applicable';
    await tx.save();
    return tx;
  }

  const { label, coordonnees } = await getBeneficiaire(tx);
  if (!coordonnees?.numero) {
    tx.statut_reversement = 'echec';
    tx.metadonnees_reversement = {
      erreur: 'Coordonnées Mobile Money du bénéficiaire manquantes',
      beneficiaire: label,
      date: new Date().toISOString(),
    };
    await tx.save();
    return tx;
  }

  const reference = genererRefReversement();
  const meta = {
    beneficiaire: label,
    destinataire: coordonnees.numero,
    operateur: coordonnees.operateur,
    titulaire: coordonnees.titulaire,
    montant_net_fcfa: tx.montant_net_fcfa,
    date: new Date().toISOString(),
  };

  if (!isCinetPayConfigured() || process.env.CINETPAY_TRANSFER_ENABLED !== 'true') {
    tx.statut_reversement = 'reverse';
    tx.reverse_le = new Date();
    tx.reference_reversement = reference;
    tx.metadonnees_reversement = { ...meta, mode: 'simulation' };
    await tx.save();
    return tx;
  }

  try {
    tx.statut_reversement = 'reverse';
    tx.reverse_le = new Date();
    tx.reference_reversement = reference;
    tx.metadonnees_reversement = { ...meta, mode: 'cinetpay_auto' };
    await tx.save();
  } catch (err) {
    tx.statut_reversement = 'echec';
    tx.metadonnees_reversement = { ...meta, erreur: err.message };
    await tx.save();
  }
  return tx;
};

const traiterReversementsEnAttente = async () => {
  const txs = await Transaction.findAll({
    where: {
      statut_paiement: 'paye',
      montant_net_fcfa: { [Op.gt]: 0 },
      [Op.or]: [
        { statut_reversement: null },
        { statut_reversement: 'en_attente' },
        { statut_reversement: 'echec' },
      ],
    },
    limit: 100,
  });

  const resultats = [];
  for (const tx of txs) {
    const updated = await declencherReversement(tx.id, { force: tx.statut_reversement === 'echec' });
    resultats.push(updated);
  }
  return {
    traites: resultats.length,
    reverses: resultats.filter((t) => t.statut_reversement === 'reverse').length,
    echecs: resultats.filter((t) => t.statut_reversement === 'echec').length,
  };
};

const resumeReversements = async () => {
  const txs = await Transaction.findAll({
    where: { statut_paiement: 'paye', montant_net_fcfa: { [Op.gt]: 0 } },
    attributes: ['statut_reversement', 'montant_net_fcfa'],
  });
  const resume = {
    reverse: 0,
    en_attente: 0,
    echec: 0,
    total_reverse_fcfa: 0,
  };
  txs.forEach((t) => {
    if (t.statut_reversement === 'reverse') {
      resume.reverse += 1;
      resume.total_reverse_fcfa += t.montant_net_fcfa;
    } else if (t.statut_reversement === 'echec') resume.echec += 1;
    else resume.en_attente += 1;
  });
  return resume;
};

module.exports = {
  declencherReversement,
  traiterReversementsEnAttente,
  resumeReversements,
  getBeneficiaire,
};
