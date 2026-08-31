/**
 * Test SMS live + OTP Africa's Talking (secrets masqués).
 * Usage: node scripts/test-sms-live.js [+2376XXXXXXXX]
 */
require('dotenv').config({ override: true });
const https = require('https');
const smsService = require('../services/sms.service');
const otpService = require('../services/otp.service');
const { smsConfig } = require('../config/sms');

const agent = new https.Agent({ rejectUnauthorized: false });
const u = (process.env.AFRICAS_TALKING_USERNAME || '').trim();
const k = (process.env.AFRICAS_TALKING_API_KEY || '').trim();
const isSandbox = u.toLowerCase() === 'sandbox';
const host = isSandbox ? 'api.sandbox.africastalking.com' : 'api.africastalking.com';

console.log('── Config SMS ──');
console.log({
  mode: smsConfig.mode,
  username: u,
  keyLength: k.length,
  host,
  senderId: process.env.AFRICAS_TALKING_SENDER_ID || '(auto)',
});

const testAuth = () => new Promise((resolve) => {
  const req = https.request({
    hostname: host,
    path: `/version1/user?username=${encodeURIComponent(u)}`,
    method: 'GET',
    agent,
    headers: { apiKey: k, Accept: 'application/json' },
  }, (res) => {
    let d = '';
    res.on('data', (c) => { d += c; });
    res.on('end', () => {
      console.log('\n── Auth AT ──');
      console.log('HTTP', res.statusCode);
      console.log(d.slice(0, 400));
      resolve(res.statusCode === 200);
    });
  });
  req.on('error', (e) => { console.log('Auth ERR', e.message); resolve(false); });
  req.end();
});

const testSms = async (phone) => {
  console.log('\n── Envoi SMS test ──');
  console.log('Vers:', phone.replace(/\d(?=\d{4})/g, '*'));
  try {
    const r = await smsService.sendSms(phone, 'DjamSanté — test SMS live. Si vous recevez ce message, l\'envoi fonctionne.');
    console.log('OK', r);
    return true;
  } catch (err) {
    console.log('ÉCHEC SMS:', err.message);
    return false;
  }
};

const testOtp = async (phone) => {
  console.log('\n── OTP envoyer ──');
  try {
    const r = await otpService.sendOtp({ telephone: phone, usage: 'register' });
    console.log('OTP envoyé:', { message: r.message, mode: r.mode, hint: r.hint });
    if (r.mode === 'mock' || r.hint) {
      console.log('Code test:', r.hint || process.env.SMS_MOCK_CODE);
    }
    return r;
  } catch (err) {
    console.log('ÉCHEC OTP send:', err.message);
    return null;
  }
};

(async () => {
  const authOk = await testAuth();
  if (!authOk) {
    console.log('\n⚠️  Auth échouée — vérifiez username/clé live sur account.africastalking.com');
    process.exit(1);
  }

  const phone = process.argv[2] || process.env.SMS_TEST_PHONE;
  if (!phone) {
    console.log('\nℹ️  Auth OK. Pour tester l\'envoi : node scripts/test-sms-live.js +2376XXXXXXXX');
    process.exit(0);
  }

  await testSms(phone);
  await testOtp(phone);
})();
