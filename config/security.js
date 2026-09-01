const rateLimit = require('express-rate-limit');

const WINDOW_MS = 15 * 60 * 1000;

const buildCorsOptions = () => {
  const origins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  return {
    origin(origin, callback) {
      if (!origin || origins.includes(origin) || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Origine non autorisée par CORS'));
      }
    },
    credentials: true,
  };
};

const globalApiLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: parseInt(process.env.RATE_LIMIT_GLOBAL || '3000', 10),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const p = req.path || req.originalUrl || '';
    return p === '/api/health'
      || p === '/health'
      || p.startsWith('/api/auth/')
      || p === '/api/auth/login'
      || p === '/api/auth/refresh';
  },
  message: { success: false, message: 'Trop de requêtes, réessayez dans quelques minutes' },
});

const authLoginLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: parseInt(process.env.RATE_LIMIT_LOGIN || '60', 10),
  message: { success: false, message: 'Trop de tentatives de connexion. Réessayez plus tard.' },
});

const authRegisterLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: parseInt(process.env.RATE_LIMIT_REGISTER || '10', 10),
  message: { success: false, message: 'Trop d\'inscriptions depuis cette adresse. Réessayez plus tard.' },
});

const ordonnanceVerifyLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: parseInt(process.env.RATE_LIMIT_ORD_VERIFY || '15', 10),
  message: { success: false, message: 'Trop de tentatives de vérification. Réessayez plus tard.' },
});

const inscriptionStatutLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: parseInt(process.env.RATE_LIMIT_INSCRIPTION_STATUT || '10', 10),
  message: { success: false, message: 'Trop de consultations de statut. Réessayez plus tard.' },
});

const authOtpLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: parseInt(process.env.RATE_LIMIT_OTP || '15', 10),
  message: { success: false, message: 'Trop de demandes de code SMS. Réessayez plus tard.' },
});

module.exports = {
  buildCorsOptions,
  globalApiLimiter,
  authLoginLimiter,
  authRegisterLimiter,
  ordonnanceVerifyLimiter,
  inscriptionStatutLimiter,
  authOtpLimiter,
};
