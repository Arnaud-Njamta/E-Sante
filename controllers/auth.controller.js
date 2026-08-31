const authService = require('../services/auth.service');
const otpService = require('../services/otp.service');
const adminAudit = require('../services/admin-audit.service');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    adminAudit.log({
      categorie: adminAudit.CATEGORIES.AUTH,
      action: adminAudit.ACTIONS.CONNEXION,
      acteur: { id: result.user?.id, role: result.role, profile: result.user },
      details: {
        email: (req.body.email || '').trim().toLowerCase(),
        role: result.role,
      },
      ip: req.ip || req.headers['x-forwarded-for'] || null,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const profile = await authService.loadProfile(req.user.id, req.user.role);
    res.json({ success: true, data: { user: profile, role: req.user.role } });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const result = await authService.resetPassword(token, password);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    const result = await authService.changePassword(
      req.user.id,
      req.user.role,
      current_password,
      new_password,
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const sendOtp = async (req, res, next) => {
  try {
    const result = await otpService.sendOtp(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getSmsConfig = async (_req, res) => {
  const { smsConfig } = require('../config/sms');
  res.json({
    success: true,
    data: {
      otp_required: !!smsConfig.otpRequired,
      mode: smsConfig.mode,
      verification_channel: smsConfig.otpRequired ? 'sms' : 'email',
    },
  });
};

const verifyOtp = async (req, res, next) => {
  try {
    const result = await otpService.verifyOtp(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const resetPasswordBySms = async (req, res, next) => {
  try {
    const result = await authService.resetPasswordBySms(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register, login, refresh, me, forgotPassword, resetPassword, changePassword,
  sendOtp, verifyOtp, resetPasswordBySms, getSmsConfig,
};
