/** Configuration SMS / OTP */

const OTP_USAGES = {
  REGISTER: 'register',
  RESET_PASSWORD: 'reset_password',
  RDV_REMINDER: 'rdv_reminder',
};

const SMS_MODE = (process.env.SMS_MODE || 'mock').toLowerCase();

const smsConfig = {
  mode: SMS_MODE === 'live' ? 'live' : 'mock',
  mockCode: process.env.SMS_MOCK_CODE || '123456',
  otpRequired: process.env.SMS_OTP_REQUIRED !== 'false',
  otpLength: parseInt(process.env.SMS_OTP_LENGTH || '6', 10),
  otpTtlMinutes: parseInt(process.env.SMS_OTP_TTL_MINUTES || '10', 10),
  verificationTokenTtlMinutes: parseInt(process.env.SMS_VERIFICATION_TOKEN_TTL_MINUTES || '30', 10),
  maxAttempts: parseInt(process.env.SMS_OTP_MAX_ATTEMPTS || '5', 10),
  resendCooldownSeconds: parseInt(process.env.SMS_OTP_RESEND_COOLDOWN || '60', 10),
  provider: process.env.SMS_PROVIDER || 'africas_talking',
  africasTalking: {
    apiKey: process.env.AFRICAS_TALKING_API_KEY || '',
    username: process.env.AFRICAS_TALKING_USERNAME || '',
    senderId: process.env.AFRICAS_TALKING_SENDER_ID || 'DjamSante',
  },
};

const isMockMode = () => smsConfig.mode === 'mock';

module.exports = {
  OTP_USAGES,
  smsConfig,
  isMockMode,
};
