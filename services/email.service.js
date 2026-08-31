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

    return nodemailer.createTransport(config);
};

/**
 * Envoyer un email de réinitialisation de mot de passe
 */
const sendResetPasswordEmail = async (email, token) => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

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

  const mailOptions = {
    from: process.env.SMTP_FROM || '"DjamSanté" <noreply@djamsante.cm>',
    to: medecinEmail,
    subject: `Invitation — ${etablissementNom} souhaite vous affilier`,
    html: htmlContent,
  };

  try {
    if (!process.env.SMTP_HOST) {
      console.log(`[EMAIL MOCK] Invitation affiliation → ${medecinEmail} (${etablissementNom})`);
      console.log(`  Lien: ${carriereUrl}`);
      return;
    }
    const transporter = createTransporter();
    await transporter.sendMail(mailOptions);
    console.log(`Email invitation affiliation envoyé à ${medecinEmail}`);
  } catch (error) {
    console.error('Erreur email invitation:', error.message);
  }
};

module.exports = {
    sendResetPasswordEmail,
    sendAffiliationInviteEmail,
};
