const { Patient, Medecin, Etablissement } = require('../models');
const reversementService = require('./reversement.service');

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' });
};

const genererRecuHtml = async (tx) => {
  const patient = await Patient.findByPk(tx.patient_id, {
    attributes: ['nom', 'prenom', 'email', 'telephone'],
  });
  const { label: beneficiaire } = await reversementService.getBeneficiaire(tx);

  const numeroRecu = tx.reference_paiement || tx.id.slice(0, 8).toUpperCase();

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Reçu DjamSanté ${numeroRecu}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 640px; margin: 40px auto; color: #0F172A; padding: 0 16px; }
    .header { text-align: center; border-bottom: 3px solid #007A5E; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { margin: 0; color: #007A5E; font-size: 1.5rem; }
    .header p { margin: 4px 0 0; color: #64748B; font-size: 0.9rem; }
    .badge { display: inline-block; background: #ECFDF5; color: #047857; padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 0.85rem; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    td { padding: 10px 0; border-bottom: 1px solid #E2E8F0; font-size: 0.92rem; }
    td:last-child { text-align: right; font-weight: 600; }
    .total { font-size: 1.2rem; color: #007A5E; }
    .footer { margin-top: 32px; font-size: 0.75rem; color: #94A3B8; text-align: center; }
    @media print { body { margin: 20px; } .no-print { display: none; } }
    .btn { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #007A5E; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="header">
    <h1>DjamSanté</h1>
    <p>Reçu de paiement — Santé numérique Cameroun</p>
    <p style="margin-top:12px"><span class="badge">PAYÉ</span></p>
  </div>

  <p><strong>N° reçu :</strong> ${numeroRecu}</p>
  <p><strong>Date :</strong> ${formatDate(tx.paye_le || tx.updatedAt)}</p>
  <p><strong>Patient :</strong> ${patient?.prenom || ''} ${patient?.nom || ''}</p>
  <p><strong>Prestataire :</strong> ${beneficiaire}</p>
  <p><strong>Service :</strong> ${tx.libelle || tx.type}</p>

  <table>
    <tr><td>Montant service</td><td>${Number(tx.montant_brut_fcfa).toLocaleString('fr-FR')} FCFA</td></tr>
    <tr><td>Frais plateforme DjamSanté</td><td>${Number(tx.commission_fcfa).toLocaleString('fr-FR')} FCFA</td></tr>
    <tr><td class="total">Total payé</td><td class="total">${Number(tx.montant_brut_fcfa).toLocaleString('fr-FR')} FCFA</td></tr>
  </table>

  <p style="font-size:0.85rem;color:#64748B">
    Canal : ${tx.canal_paiement || tx.provider || 'Mobile Money'}<br/>
    Réf. paiement : ${tx.reference_paiement || '—'}
  </p>

  <div class="no-print" style="text-align:center">
    <button class="btn" onclick="window.print()">Imprimer / Enregistrer en PDF</button>
  </div>

  <div class="footer">
    DjamSanté — Conformité MINSANTE / CSU Cameroun<br/>
    Ce document fait foi de paiement électronique.
  </div>
</body>
</html>`;
};

module.exports = { genererRecuHtml };
