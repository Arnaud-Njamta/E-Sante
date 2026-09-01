const escapeHtml = (s) => String(s ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const genererHtmlOrdonnance = (doc) => {
  const meds = (doc.medicaments || []).map((m) => {
    const nom = escapeHtml(m.nom || m.dci || m.medicament || m);
    const poso = escapeHtml(m.posologie || m.dosage || '');
    return `<li><strong>${nom}</strong>${poso ? ` — ${poso}` : ''}</li>`;
  }).join('');

  const medecin = doc.medecin
    ? `Dr ${escapeHtml(doc.medecin.prenom)} ${escapeHtml(doc.medecin.nom)}`
    : 'Médecin';
  const specialite = escapeHtml(doc.medecin?.specialite || '');
  const numeroOrdre = escapeHtml(doc.medecin?.numero_ordre || '');
  const patient = doc.patient
    ? `${escapeHtml(doc.patient.prenom)} ${escapeHtml(doc.patient.nom)}`
    : 'Patient';
  const dateSign = doc.signed_at
    ? new Date(doc.signed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('fr-FR');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8"/>
  <title>Ordonnance ${escapeHtml(doc.numero_unique)}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 720px; margin: 40px auto; padding: 24px; color: #1e293b; }
    h1 { font-size: 1.4rem; border-bottom: 2px solid #0ea5e9; padding-bottom: 8px; }
    .meta { color: #64748b; font-size: 0.9rem; margin: 16px 0; }
    .patient { background: #f8fafc; padding: 12px; border-radius: 8px; margin: 16px 0; }
    ul { line-height: 1.8; }
    .footer { margin-top: 32px; font-size: 0.8rem; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
    .code { font-family: monospace; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>Ordonnance électronique — DjamSanté</h1>
  <p class="meta"><strong>N°</strong> ${escapeHtml(doc.numero_unique)} · <strong>Code vérification</strong> <span class="code">${escapeHtml(doc.code_verification)}</span></p>
  <div class="patient"><strong>Patient :</strong> ${patient}</div>
  <p><strong>Prescripteur :</strong> ${medecin}${specialite ? ` — ${specialite}` : ''}${numeroOrdre ? ` (N° ordre ${numeroOrdre})` : ''}</p>
  ${doc.diagnostic ? `<p><em>Diagnostic : ${escapeHtml(doc.diagnostic)}</em></p>` : ''}
  <h2>Prescription</h2>
  <ul>${meds || '<li>—</li>'}</ul>
  ${doc.instructions ? `<p><strong>Instructions :</strong> ${escapeHtml(doc.instructions)}</p>` : ''}
  <p class="meta">Signée le ${dateSign} · Valable jusqu'au ${escapeHtml(doc.date_expiration || '—')}</p>
  <div class="footer">
    <p>${escapeHtml(doc.legal_notice || 'Document électronique signé — présentez ce fichier en pharmacie avec une pièce d\'identité.')}</p>
    <p>Vérification : ${escapeHtml(doc.numero_unique)} + code ${escapeHtml(doc.code_verification)}</p>
  </div>
</body>
</html>`;
};

module.exports = { genererHtmlOrdonnance };
