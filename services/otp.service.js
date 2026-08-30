const crypto = require('crypto');
const { Op } = require('sequelize');
const { OtpCode, Patient } = require('../models');
const { normalizeNumeroCm } = require('../config/paiement');
const { OTP_USAGES, smsConfig, isMockMode } = require('../config/sms');
const smsService = require('./sms.service');

const USAGE_LABELS = {
  [OTP_USAGES.REGISTER]: 'd\'inscription',
  [OTP_USAGES.RESET_PASSWORD]: 'de réinitialisation',
  [OTP_USAGES.RDV_REMINDER]: 'de rappel',
};

const hashCode = (code) => crypto.createHash('sha256').update(String(code)).digest('hex');

const generateCode = () => {
  if (isMockMode()) {
    return smsConfig.mockCode;
  }
  const max = 10 ** smsConfig.otpLength;
  const num = crypto.randomInt(0, max);
  return String(num).padStart(smsConfig.otpLength, '0');
};

const normalizeTelephone = (raw) => {
  const normalized = normalizeNumeroCm(raw);
  const digits = normalized.replace(/\D/g, '');
  if (digits.length < 9) {
    const error = new Error('Numéro de téléphone invalide');
    error.statusCode = 400;
    throw error;
  }
  return normalized;
};

const assertUsage = (usage) => {
  if (!Object.values(OTP_USAGES).includes(usage)) {
    const error = new Error('Usage OTP invalide');
    error.statusCode = 400;
    throw error;
  }
};

const checkResendCooldown = async (telephone, usage) => {
  const recent = await OtpCode.findOne({
    where: {
      telephone,
      usage,
      consumed_at: null,
      createdAt: { [Op.gte]: new Date(Date.now() - smsConfig.resendCooldownSeconds * 1000) },
    },
    order: [['createdAt', 'DESC']],
  });
  if (recent) {
    const waitSec = Math.ceil(
      (recent.createdAt.getTime() + smsConfig.resendCooldownSeconds * 1000 - Date.now()) / 1000,
    );
    const error = new Error(`Veuillez patienter ${waitSec}s avant de renvoyer un code`);
    error.statusCode = 429;
    throw error;
  }
};

const sendOtp = async ({ telephone: rawPhone, usage }) => {
  assertUsage(usage);
  const telephone = normalizeTelephone(rawPhone);

  if (usage === OTP_USAGES.REGISTER) {
    const existing = await Patient.findOne({ where: { telephone } });
    if (existing) {
      const error = new Error('Ce numéro est déjà associé à un compte');
      error.statusCode = 409;
      throw error;
    }
  }

  if (usage === OTP_USAGES.RESET_PASSWORD) {
    const patient = await Patient.findOne({ where: { telephone } });
    if (!patient) {
      return {
        message: 'Si un compte existe avec ce numéro, un code a été envoyé.',
        expires_in_minutes: smsConfig.otpTtlMinutes,
        ...(isMockMode() ? { mode: 'mock', hint: `Code de test : ${smsConfig.mockCode}` } : {}),
      };
    }
  }

  await checkResendCooldown(telephone, usage);

  await OtpCode.update(
    { consumed_at: new Date() },
    { where: { telephone, usage, consumed_at: null } },
  );

  const code = generateCode();
  const expiresAt = new Date(Date.now() + smsConfig.otpTtlMinutes * 60 * 1000);

  await OtpCode.create({
    telephone,
    code_hash: hashCode(code),
    usage,
    expires_at: expiresAt,
  });

  await smsService.sendOtpMessage(telephone, code, USAGE_LABELS[usage] || '');

  return {
    message: 'Code envoyé par SMS',
    expires_in_minutes: smsConfig.otpTtlMinutes,
    telephone,
    ...(isMockMode() ? { mode: 'mock', hint: `Code de test : ${smsConfig.mockCode}` } : {}),
  };
};

const verifyOtp = async ({ telephone: rawPhone, code, usage }) => {
  assertUsage(usage);
  const telephone = normalizeTelephone(rawPhone);

  const record = await OtpCode.findOne({
    where: {
      telephone,
      usage,
      consumed_at: null,
      verified_at: null,
    },
    order: [['createdAt', 'DESC']],
  });

  if (!record) {
    const error = new Error('Aucun code en cours. Demandez un nouveau code.');
    error.statusCode = 400;
    throw error;
  }

  if (record.expires_at < new Date()) {
    const error = new Error('Code expiré. Demandez un nouveau code.');
    error.statusCode = 400;
    throw error;
  }

  if (record.attempts >= smsConfig.maxAttempts) {
    const error = new Error('Trop de tentatives. Demandez un nouveau code.');
    error.statusCode = 429;
    throw error;
  }

  const valid = hashCode(code) === record.code_hash;
  record.attempts += 1;
  await record.save();

  if (!valid) {
    const error = new Error('Code incorrect');
    error.statusCode = 400;
    throw error;
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');
  const tokenExpires = new Date(Date.now() + smsConfig.verificationTokenTtlMinutes * 60 * 1000);

  record.verified_at = new Date();
  record.verification_token = verificationToken;
  record.verification_token_expires = tokenExpires;
  await record.save();

  return {
    message: 'Téléphone vérifié',
    verification_token: verificationToken,
    telephone,
    expires_at: tokenExpires.toISOString(),
  };
};

const consumeVerificationToken = async ({ verificationToken, telephone: rawPhone, usage }) => {
  assertUsage(usage);
  const telephone = normalizeTelephone(rawPhone);

  const record = await OtpCode.findOne({
    where: {
      verification_token: verificationToken,
      telephone,
      usage,
      consumed_at: null,
    },
    order: [['createdAt', 'DESC']],
  });

  if (!record || !record.verified_at) {
    const error = new Error('Vérification téléphone invalide ou expirée');
    error.statusCode = 400;
    throw error;
  }

  if (!record.verification_token_expires || record.verification_token_expires < new Date()) {
    const error = new Error('Vérification téléphone expirée. Recommencez la vérification.');
    error.statusCode = 400;
    throw error;
  }

  record.consumed_at = new Date();
  await record.save();

  return { telephone };
};

module.exports = {
  sendOtp,
  verifyOtp,
  consumeVerificationToken,
  normalizeTelephone,
  OTP_USAGES,
};
