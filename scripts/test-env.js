/**
 * Diagnostic .env — n'affiche jamais les secrets en clair.
 * Usage: node scripts/test-env.js
 */
require('dotenv').config();
const nodemailer = require('nodemailer');
const https = require('https');

const mask = (v) => {
  if (!v) return '(vide)';
  if (v.length <= 4) return '****';
  return `${v.slice(0, 2)}…${v.slice(-2)} (${v.length} car.)`;
};

const ok = (msg) => console.log(`  ✅ ${msg}`);
const ko = (msg) => console.log(`  ❌ ${msg}`);
const info = (msg) => console.log(`  ℹ️  ${msg}`);

const section = (t) => console.log(`\n── ${t} ──`);

const testSmtp = async () => {
  section('SMTP (e-mails)');
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  info(`HOST=${host || '(vide)'} PORT=${port}`);
  info(`USER=${mask(user)} FROM=${from || '(défaut)'}`);

  if (!host) {
    ko('SMTP_HOST manquant — e-mails en mock uniquement');
    return { ok: false };
  }
  if (!user || !pass) {
    ko('SMTP_USER ou SMTP_PASS manquant');
    return { ok: false };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });

  try {
    await transporter.verify();
    ok('Connexion SMTP vérifiée (verify OK)');
  } catch (err) {
    ko(`Connexion SMTP échouée: ${err.message}`);
    return { ok: false, error: err.message };
  }

  try {
    const infoMail = await transporter.sendMail({
      from: from || user,
      to: user,
      subject: 'Test DjamSanté — SMTP OK',
      text: 'Ceci est un e-mail de test automatique. Si vous le lisez, SMTP fonctionne.',
      html: '<p>Ceci est un <strong>e-mail de test</strong> DjamSanté. SMTP fonctionne.</p>',
    });
    ok(`E-mail de test envoyé à ${user} (id: ${infoMail.messageId || 'n/a'})`);
    return { ok: true };
  } catch (err) {
    ko(`Envoi e-mail échoué: ${err.message}`);
    return { ok: false, error: err.message };
  }
};

const testSms = async () => {
  section('SMS / Africa\'s Talking');
  const mode = (process.env.SMS_MODE || 'mock').toLowerCase();
  const user = process.env.AFRICAS_TALKING_USERNAME;
  const key = process.env.AFRICAS_TALKING_API_KEY;
  const sender = process.env.AFRICAS_TALKING_SENDER_ID;

  info(`SMS_MODE=${mode}`);
  info(`USERNAME=${mask(user)} API_KEY=${mask(key)} SENDER=${sender || '(vide)'}`);
  info(`OTP_REQUIRED=${process.env.SMS_OTP_REQUIRED}`);

  if (mode !== 'live') {
    info('Mode mock — aucun SMS réel ne part (normal en local)');
    ok('Config SMS lisible (mock)');
    return { ok: true, mock: true };
  }

  if (!user || !key) {
    ko('Clés Africa\'s Talking manquantes pour SMS_MODE=live');
    return { ok: false };
  }
  if (key.length < 20) {
    ko('API_KEY semble trop courte — vérifiez la clé complète dans le dashboard Africa\'s Talking');
  } else {
    ok('API_KEY présente (longueur OK)');
  }
  return { ok: true };
};

const testGemini = async () => {
  section('Gemini (IA)');
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  info(`MODEL=${model}`);
  info(`KEY=${mask(key)}`);

  if (!key) {
    ko('GEMINI_API_KEY manquante');
    return { ok: false };
  }

  if (!key.startsWith('AIza') && !key.startsWith('AQ.')) {
    info('Format de clé inhabituel — si erreurs 403, recréez une clé sur https://aistudio.google.com/apikey');
  }

  return new Promise((resolve) => {
    const path = `/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
    const body = JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: 'Réponds uniquement: OK' }] }],
    });
    const agent = new https.Agent({ rejectUnauthorized: false });
    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path,
      method: 'POST',
      agent,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
      timeout: 25000,
    }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          ok(`Gemini répond (HTTP ${res.statusCode})`);
          resolve({ ok: true });
          return;
        }
        let msg = data.slice(0, 200);
        try {
          msg = JSON.parse(data).error?.message || msg;
        } catch { /* ignore */ }
        ko(`Gemini HTTP ${res.statusCode}: ${msg}`);
        resolve({ ok: false, error: msg });
      });
    });
    req.on('error', (err) => {
      ko(`Connexion Gemini: ${err.message}`);
      resolve({ ok: false, error: err.message });
    });
    req.write(body);
    req.end();
  });
};

const testReminders = () => {
  section('Rappels');
  info(`RDV_REMINDER_ENABLED=${process.env.RDV_REMINDER_ENABLED}`);
  info(`RDV_REMINDER_EMAIL=${process.env.RDV_REMINDER_EMAIL}`);
  info(`RDV_REMINDER_SMS=${process.env.RDV_REMINDER_SMS}`);
  info(`PRISE_REMINDER_ENABLED=${process.env.PRISE_REMINDER_ENABLED}`);
  ok('Flags rappels lus');
};

(async () => {
  console.log('Diagnostic DjamSanté (.env) — secrets masqués');
  const smtp = await testSmtp();
  const sms = await testSms();
  const gemini = await testGemini();
  testReminders();

  section('Résumé');
  console.log(`  SMTP:   ${smtp.ok ? 'OK' : 'ÉCHEC'}`);
  console.log(`  SMS:    ${sms.ok ? (sms.mock ? 'OK (mock)' : 'OK') : 'ÉCHEC'}`);
  console.log(`  Gemini: ${gemini.ok ? 'OK' : 'ÉCHEC'}`);
  process.exit(smtp.ok && sms.ok ? 0 : 1);
})();
