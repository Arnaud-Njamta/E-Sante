const nodemailer = require('nodemailer');

/**
 * Créer le transporteur SMTP
 */
const createTransporter = () => {
    const config = {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: parseInt(process.env.SMTP_PORT, 10) === 465,
    };

    // Ajouter l'auth seulement si les identifiants sont fournis (pas nécessaire pour MailDev)
    if (process.env.SMTP_USER) {
        config.auth = {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        };
    }

    // Windows / Node : magasin CA parfois incomplet en dev
    if (process.env.NODE_ENV !== 'production' || process.env.SMTP_TLS_INSECURE === 'true') {
        config.tls = { rejectUnauthorized: false };
    }

    return nodemailer.createTransport(config);
};

/**
 * Envoyer un email de réinitialisation de mot de passe
 */
const sendResetPasswordEmail = async (email, token) => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
      <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">🏥 DjamSanté</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Votre santé, notre priorité</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #333; margin: 0 0 16px; font-size: 22px;">Réinitialisation de votre mot de passe</h2>
          <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
            Vous avez demandé la réinitialisation de votre mot de passe. 
            Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
          </p>
          
          <!-- Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; letter-spacing: 0.5px;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          
          <!-- Link fallback -->
          <p style="color: #888; font-size: 13px; line-height: 1.5; margin: 24px 0 0;">
            Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
          </p>
          <p style="color: #667eea; font-size: 13px; word-break: break-all; margin: 8px 0 0;">
            ${resetUrl}
          </p>
          
          <!-- Warning -->
          <div style="background-color: #fff8e1; border-left: 4px solid #ffc107; padding: 16px; border-radius: 4px; margin: 24px 0 0;">
            <p style="color: #856404; font-size: 13px; margin: 0; line-height: 1.5;">
              ⚠️ Ce lien est valable pendant <strong>1 heure</strong>. Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email.
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #aaa; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} DjamSanté — Application d'observance thérapeutique
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

    const mailOptions = {
        from: process.env.SMTP_FROM || '"DjamSanté" <noreply@e-sante.com>',
        to: email,
        subject: '🔐 Réinitialisation de votre mot de passe — DjamSanté',
        html: htmlContent,
    };

    try {
        const transporter = createTransporter();
        await transporter.sendMail(mailOptions);
        console.log(`Email de réinitialisation envoyé à ${email}`);
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error.message);
    }
};

const sendAffiliationInviteEmail = async ({
  medecinEmail, medecinNom, etablissementNom, message,
}) => {
  if (!medecinEmail) return;

  const frontUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const carriereUrl = `${frontUrl}/medecin/carriere`;

  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #0B3D30;">Invitation d'affiliation — DjamSanté</h2>
      <p>Bonjour Dr. ${medecinNom},</p>
      <p><strong>${etablissementNom}</strong> vous invite à rejoindre son équipe sur DjamSanté.</p>
      ${message ? `<p style="color: #64748B; font-style: italic;">« ${message} »</p>` : ''}
      <p>Connectez-vous pour accepter ou refuser l'invitation :</p>
      <p><a href="${carriereUrl}" style="display: inline-block; background: #0B3D30; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Voir l'invitation</a></p>
      <p style="font-size: 12px; color: #94A3B8;">DjamSanté — Santé numérique Cameroun</p>
    </div>
  `;

  await sendMailSafe({
    to: medecinEmail,
    subject: `Invitation — ${etablissementNom} souhaite vous affilier`,
    html: htmlContent,
    mockLabel: `Invitation affiliation → ${medecinEmail}`,
  });
};

const brandWrap = (title, bodyHtml) => `
<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,sans-serif;background:#f4f7fa;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08);">
    <div style="background:linear-gradient(135deg,#0B3D30 0%,#2F6B4F 100%);padding:32px 28px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;">DjamSanté</h1>
      <p style="color:rgba(255,255,255,.85);margin:8px 0 0;font-size:13px;">Votre santé, notre priorité — Cameroun</p>
    </div>
    <div style="padding:32px 28px;">
      <h2 style="color:#1C1917;margin:0 0 12px;font-size:20px;">${title}</h2>
      ${bodyHtml}
    </div>
    <div style="background:#f8f9fa;padding:16px 28px;text-align:center;border-top:1px solid #eee;">
      <p style="color:#aaa;font-size:12px;margin:0;">© ${new Date().getFullYear()} DjamSanté</p>
    </div>
  </div>
</body></html>`;

const sendMailSafe = async ({ to, subject, html, mockLabel }) => {
  if (!to) return { sent: false, reason: 'no_recipient' };
    if (!process.env.SMTP_HOST) {
    console.log(`[EMAIL MOCK] ${mockLabel || subject} → ${to}`);
    console.warn('[EMAIL] SMTP non configuré — configurez SMTP_HOST dans .env pour envoyer les e-mails');
    return { sent: false, mode: 'mock' };
  }
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"DjamSanté" <noreply@djamsante.cm>',
      to,
      subject,
      html,
    });
    console.log(`[EMAIL] ${subject} → ${to}`);
    return { sent: true };
  } catch (error) {
    console.error(`[EMAIL] Échec ${subject}:`, error.message);
    return { sent: false, error: error.message };
  }
};

const sendWelcomeEmail = async ({ email, prenom, nom }) => {
  const frontUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const name = [prenom, nom].filter(Boolean).join(' ') || 'à vous';
  const html = brandWrap(
    `Bienvenue ${prenom || ''} !`,
    `
      <p style="color:#555;font-size:15px;line-height:1.6;">
        Votre compte DjamSanté est prêt. Vous pouvez dès maintenant :
      </p>
      <ul style="color:#555;font-size:15px;line-height:1.7;">
        <li>Suivre vos traitements et rappels de prise</li>
        <li>Trouver pharmacies, hôpitaux et soignants à proximité</li>
        <li>Prendre rendez-vous et discuter avec une pharmacie</li>
        <li>Utiliser l'assistant Dr. DjamSanté pour préparer votre consultation</li>
      </ul>
      <div style="text-align:center;margin:28px 0;">
        <a href="${frontUrl}/login" style="display:inline-block;background:#0B3D30;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;">
          Ouvrir DjamSanté
        </a>
      </div>
      <p style="color:#888;font-size:13px;">Compte : ${email} — ${name}</p>
    `,
  );
  return sendMailSafe({
    to: email,
    subject: 'Bienvenue sur DjamSanté 🇨🇲',
    html,
    mockLabel: `Bienvenue → ${email}`,
  });
};

const sendRdvReminderEmail = async ({
  email, prenom, dateLabel, heure, medecinLabel,
}) => {
  const frontUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const html = brandWrap(
    'Rappel de rendez-vous',
    `
      <p style="color:#555;font-size:15px;line-height:1.6;">Bonjour ${prenom || ''},</p>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        Rappel : demain <strong>${dateLabel}</strong> à <strong>${heure}</strong>
        ${medecinLabel ? ` avec <strong>${medecinLabel}</strong>` : ''}.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${frontUrl}/rendez-vous" style="display:inline-block;background:#0B3D30;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;">
          Voir mon rendez-vous
        </a>
      </div>
    `,
  );
  return sendMailSafe({
    to: email,
    subject: `Rappel RDV demain à ${heure} — DjamSanté`,
    html,
    mockLabel: `Rappel RDV → ${email}`,
  });
};

const sendPriseReminderEmail = async ({
  email, prenom, medicament, dosage, heure,
}) => {
  const html = brandWrap(
    'Rappel de prise',
    `
      <p style="color:#555;font-size:15px;line-height:1.6;">Bonjour ${prenom || ''},</p>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        Il est bientôt l'heure de prendre <strong>${medicament}</strong>
        ${dosage ? `(${dosage})` : ''} — prévu à <strong>${heure}</strong>.
      </p>
      <p style="color:#888;font-size:13px;">Confirmez la prise dans l'application DjamSanté.</p>
    `,
  );
  return sendMailSafe({
    to: email,
    subject: `Rappel médicament ${heure} — ${medicament}`,
    html,
    mockLabel: `Rappel prise → ${email}`,
  });
};

const sendRdvDemandeEmail = async ({
  medecinEmail, medecinPrenom, patientLabel, rdvLabel, motif,
}) => {
  const frontUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const html = brandWrap(
    'Nouvelle demande de rendez-vous',
    `
      <p style="color:#555;font-size:15px;line-height:1.6;">Bonjour Dr. ${medecinPrenom || ''},</p>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        <strong>${patientLabel}</strong> demande un rendez-vous le <strong>${rdvLabel}</strong>.
      </p>
      ${motif ? `<p style="color:#64748B;font-size:14px;"><em>Motif : ${motif}</em></p>` : ''}
      <div style="text-align:center;margin:24px 0;">
        <a href="${frontUrl}/medecin/rendez-vous" style="display:inline-block;background:#0B3D30;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;">
          Gérer mes rendez-vous
        </a>
      </div>
    `,
  );
  return sendMailSafe({
    to: medecinEmail,
    subject: `Nouvelle demande RDV — ${patientLabel}`,
    html,
    mockLabel: `RDV demande médecin → ${medecinEmail}`,
  });
};

const sendRdvDemandePatientEmail = async ({
  patientEmail, patientPrenom, medecinLabel, rdvLabel,
}) => {
  const frontUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const html = brandWrap(
    'Demande de rendez-vous envoyée',
    `
      <p style="color:#555;font-size:15px;line-height:1.6;">Bonjour ${patientPrenom || ''},</p>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        Votre demande de rendez-vous avec <strong>${medecinLabel}</strong> le <strong>${rdvLabel}</strong> a bien été envoyée.
        Vous recevrez un e-mail dès que le médecin aura répondu.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${frontUrl}/rendez-vous" style="display:inline-block;background:#0B3D30;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;">
          Suivre mon rendez-vous
        </a>
      </div>
    `,
  );
  return sendMailSafe({
    to: patientEmail,
    subject: `Demande RDV envoyée — ${rdvLabel}`,
    html,
    mockLabel: `RDV demande patient → ${patientEmail}`,
  });
};

const sendRdvConfirmeEmail = async ({
  patientEmail, patientPrenom, medecinLabel, rdvLabel, typeConsultation, lienVideo, notesMedecin,
}) => {
  const frontUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const html = brandWrap(
    'Rendez-vous confirmé',
    `
      <p style="color:#555;font-size:15px;line-height:1.6;">Bonjour ${patientPrenom || ''},</p>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        Votre rendez-vous avec <strong>${medecinLabel}</strong> est confirmé pour le <strong>${rdvLabel}</strong>.
      </p>
      ${typeConsultation === 'teleconsultation' && lienVideo
    ? `<p style="color:#047857;font-size:14px;">Téléconsultation — rejoignez depuis l'application au moment du RDV.</p>`
    : '<p style="color:#64748B;font-size:14px;">Consultation en présentiel — présentez-vous à l\'heure convenue.</p>'}
      ${notesMedecin ? `<p style="background:#F0FDF4;padding:12px;border-radius:8px;font-size:14px;color:#065F46;"><strong>Message du médecin :</strong> ${notesMedecin}</p>` : ''}
      <div style="text-align:center;margin:24px 0;">
        <a href="${frontUrl}/rendez-vous" style="display:inline-block;background:#0B3D30;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;">
          Voir mon rendez-vous
        </a>
      </div>
    `,
  );
  return sendMailSafe({
    to: patientEmail,
    subject: `RDV confirmé — ${rdvLabel}`,
    html,
    mockLabel: `RDV confirmé → ${patientEmail}`,
  });
};

const sendRdvRefuseEmail = async ({
  patientEmail, patientPrenom, medecinLabel, rdvLabel, notesMedecin,
}) => {
  const frontUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const html = brandWrap(
    'Rendez-vous refusé',
    `
      <p style="color:#555;font-size:15px;line-height:1.6;">Bonjour ${patientPrenom || ''},</p>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        Votre demande de rendez-vous avec <strong>${medecinLabel}</strong> (${rdvLabel}) n'a pas pu être acceptée.
      </p>
      ${notesMedecin ? `<p style="font-size:14px;color:#64748B;"><strong>Message :</strong> ${notesMedecin}</p>` : ''}
      <div style="text-align:center;margin:24px 0;">
        <a href="${frontUrl}/sante?tab=medecins" style="display:inline-block;background:#0B3D30;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;">
          Trouver un autre médecin
        </a>
      </div>
    `,
  );
  return sendMailSafe({
    to: patientEmail,
    subject: `RDV non accepté — ${rdvLabel}`,
    html,
    mockLabel: `RDV refusé → ${patientEmail}`,
  });
};

const sendRdvContrePropositionEmail = async ({
  patientEmail, patientPrenom, medecinLabel, rdvLabel, message,
}) => {
  const frontUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const html = brandWrap(
    'Nouveau créneau proposé',
    `
      <p style="color:#555;font-size:15px;line-height:1.6;">Bonjour ${patientPrenom || ''},</p>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        <strong>${medecinLabel}</strong> vous propose un autre créneau : <strong>${rdvLabel}</strong>.
      </p>
      ${message ? `<p style="font-style:italic;color:#64748B;font-size:14px;">« ${message} »</p>` : ''}
      <div style="text-align:center;margin:24px 0;">
        <a href="${frontUrl}/rendez-vous" style="display:inline-block;background:#0B3D30;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;">
          Accepter ou refuser
        </a>
      </div>
    `,
  );
  return sendMailSafe({
    to: patientEmail,
    subject: `Nouveau créneau proposé — ${rdvLabel}`,
    html,
    mockLabel: `RDV contre-prop → ${patientEmail}`,
  });
};

const sendRdvTermineEmail = async ({
  patientEmail, patientPrenom, medecinLabel, medecinId,
}) => {
  const frontUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const html = brandWrap(
    'Consultation terminée',
    `
      <p style="color:#555;font-size:15px;line-height:1.6;">Bonjour ${patientPrenom || ''},</p>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        Votre consultation avec <strong>${medecinLabel}</strong> est terminée.
        N'hésitez pas à laisser un avis pour aider d'autres patients.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${frontUrl}/sante/medecin/${medecinId}" style="display:inline-block;background:#0B3D30;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;">
          Noter le médecin
        </a>
      </div>
    `,
  );
  return sendMailSafe({
    to: patientEmail,
    subject: `Consultation terminée — laissez un avis`,
    html,
    mockLabel: `RDV terminé → ${patientEmail}`,
  });
};

const sendOrdonnancePatientEmail = async ({
  patientEmail, patientPrenom, numero, medecinLabel,
}) => {
  const frontUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const html = brandWrap(
    'Nouvelle ordonnance électronique',
    `
      <p style="color:#555;font-size:15px;line-height:1.6;">Bonjour ${patientPrenom || ''},</p>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        <strong>${medecinLabel}</strong> vous a délivré une ordonnance électronique
        <strong>${numero}</strong>. Elle est disponible dans votre espace patient
        et utilisable en pharmacie.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${frontUrl}/ordonnances-electroniques" style="display:inline-block;background:#0B3D30;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;">
          Voir mon ordonnance
        </a>
      </div>
    `,
  );
  return sendMailSafe({
    to: patientEmail,
    subject: `Ordonnance ${numero} disponible — DjamSanté`,
    html,
    mockLabel: `Ordonnance patient → ${patientEmail}`,
  });
};

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const TYPE_PRO_LABELS = {
  medecin: 'Médecin',
  infirmier: 'Infirmier / Infirmière',
  aide_soignant: 'Aide-soignant(e)',
  sage_femme: 'Sage-femme',
  kinesitherapeute: 'Kinésithérapeute',
  pharmacie: 'Pharmacie',
  hopital: 'Hôpital',
  clinique: 'Clinique',
};

const formatProDisplayName = ({ prenom, nom, nom_structure, type_profil }) => {
  if (prenom || nom) return [prenom, nom].filter(Boolean).join(' ');
  if (nom_structure) return nom_structure;
  return TYPE_PRO_LABELS[type_profil] || 'professionnel';
};

/** Accusé de réception après inscription professionnelle */
const sendInscriptionProRecueEmail = async ({
  email, prenom, nom, nom_structure, type_profil, documents_manquants = [],
}) => {
  const frontUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const typeLabel = TYPE_PRO_LABELS[type_profil] || type_profil || 'professionnel';
  const displayName = formatProDisplayName({ prenom, nom, nom_structure, type_profil });
  const manquantsHtml = documents_manquants.length
    ? `<div style="background:#FFFBEB;border-left:4px solid #F59E0B;padding:14px;border-radius:6px;margin:18px 0;">
        <p style="margin:0 0 8px;color:#92400E;font-size:14px;"><strong>Documents encore attendus :</strong></p>
        <ul style="margin:0;padding-left:18px;color:#92400E;font-size:14px;line-height:1.6;">
          ${documents_manquants.map((d) => `<li>${escapeHtml(d)}</li>`).join('')}
        </ul>
      </div>`
    : `<p style="color:#047857;font-size:14px;">Votre dossier documentaire a bien été reçu et est en cours de vérification.</p>`;

  const html = brandWrap(
    'Demande d\'inscription reçue',
    `
      <p style="color:#555;font-size:15px;line-height:1.6;">Bonjour <strong>${escapeHtml(displayName)}</strong>,</p>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        Nous avons bien reçu votre demande d'inscription en tant que
        <strong>${escapeHtml(typeLabel)}</strong> sur DjamSanté Pro.
      </p>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        Votre compte est déjà créé. Vous pouvez vous connecter pendant que notre équipe
        (validation type MINSANTE) examine votre dossier.
      </p>
      ${manquantsHtml}
      <div style="text-align:center;margin:28px 0;">
        <a href="${frontUrl}/login" style="display:inline-block;background:#0B3D30;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;">
          Se connecter
        </a>
      </div>
      <p style="color:#888;font-size:13px;">Compte : ${escapeHtml(email)}</p>
    `,
  );
  return sendMailSafe({
    to: email,
    subject: `Inscription ${typeLabel} reçue — DjamSanté`,
    html,
    mockLabel: `Inscription pro reçue → ${email}`,
  });
};

/** Validation / confirmation d'un compte professionnel */
const sendInscriptionProValideeEmail = async ({
  email, prenom, nom, nom_structure, type_profil,
}) => {
  const frontUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const typeLabel = TYPE_PRO_LABELS[type_profil] || type_profil || 'professionnel';
  const displayName = formatProDisplayName({ prenom, nom, nom_structure, type_profil });
  const isStructure = ['pharmacie', 'hopital', 'clinique'].includes(type_profil);

  const html = brandWrap(
    'Inscription validée ✓',
    `
      <p style="color:#555;font-size:15px;line-height:1.6;">Bonjour <strong>${escapeHtml(displayName)}</strong>,</p>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        Bonne nouvelle : votre dossier <strong>${escapeHtml(typeLabel)}</strong> a été
        <strong style="color:#047857;">validé</strong> sur DjamSanté.
      </p>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        ${isStructure
    ? 'Votre structure est désormais visible dans l\'annuaire et peut recevoir des demandes patients.'
    : 'Votre profil est désormais visible dans l\'annuaire et vous pouvez recevoir des rendez-vous patients.'}
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${frontUrl}/login" style="display:inline-block;background:#0B3D30;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;">
          Accéder à mon espace
        </a>
      </div>
      <p style="color:#888;font-size:13px;">Compte : ${escapeHtml(email)}</p>
    `,
  );
  return sendMailSafe({
    to: email,
    subject: `Compte ${typeLabel} validé — DjamSanté`,
    html,
    mockLabel: `Inscription pro validée → ${email}`,
  });
};

/** Rejet d'inscription professionnelle avec motif personnalisé */
const sendInscriptionProRejeteeEmail = async ({
  email, prenom, nom, nom_structure, type_profil, motif_rejet,
}) => {
  const frontUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const typeLabel = TYPE_PRO_LABELS[type_profil] || type_profil || 'professionnel';
  const displayName = formatProDisplayName({ prenom, nom, nom_structure, type_profil });
  const motif = String(motif_rejet || '').trim() || 'Motif non précisé — contactez le support.';

  const html = brandWrap(
    'Inscription non validée',
    `
      <p style="color:#555;font-size:15px;line-height:1.6;">Bonjour <strong>${escapeHtml(displayName)}</strong>,</p>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        Après examen, votre demande d'inscription en tant que
        <strong>${escapeHtml(typeLabel)}</strong> n'a pas pu être validée pour le moment.
      </p>
      <div style="background:#FEF2F2;border-left:4px solid #DC2626;padding:14px;border-radius:6px;margin:18px 0;">
        <p style="margin:0 0 6px;color:#991B1B;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">
          Motif du refus
        </p>
        <p style="margin:0;color:#7F1D1D;font-size:15px;line-height:1.55;">
          ${escapeHtml(motif)}
        </p>
      </div>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        Vous pouvez corriger votre dossier et soumettre une nouvelle demande, ou nous contacter pour plus d'informations.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${frontUrl}/register/professionnel" style="display:inline-block;background:#0B3D30;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;">
          Nouvelle demande
        </a>
      </div>
      <p style="color:#888;font-size:13px;">Compte concerné : ${escapeHtml(email)}</p>
    `,
  );
  return sendMailSafe({
    to: email,
    subject: `Inscription ${typeLabel} non validée — DjamSanté`,
    html,
    mockLabel: `Inscription pro rejetée → ${email}`,
  });
};

module.exports = {
  sendResetPasswordEmail,
  sendAffiliationInviteEmail,
  sendWelcomeEmail,
  sendRdvReminderEmail,
  sendPriseReminderEmail,
  sendRdvDemandeEmail,
  sendRdvDemandePatientEmail,
  sendRdvConfirmeEmail,
  sendRdvRefuseEmail,
  sendRdvContrePropositionEmail,
  sendRdvTermineEmail,
  sendOrdonnancePatientEmail,
  sendInscriptionProRecueEmail,
  sendInscriptionProValideeEmail,
  sendInscriptionProRejeteeEmail,
};
