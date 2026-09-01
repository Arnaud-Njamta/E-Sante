const Joi = require('joi');
const { smsConfig } = require('../config/sms');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors,
      });
    }

    next();
  };
};

// ==================== SCHEMAS DE VALIDATION ====================

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email invalide',
    'any.required': 'L\'email est requis',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
    'any.required': 'Le mot de passe est requis',
  }),
  nom: Joi.string().min(2).max(100).required().messages({
    'any.required': 'Le nom est requis',
  }),
  prenom: Joi.string().min(2).max(100).required().messages({
    'any.required': 'Le prénom est requis',
  }),
  date_naissance: Joi.date().iso().optional(),
  telephone: smsConfig.otpRequired
    ? Joi.string().min(9).required().messages({
      'any.required': 'Le téléphone est requis',
      'string.min': 'Numéro de téléphone invalide',
    })
    : Joi.string().min(9).allow('', null).optional().messages({
      'string.min': 'Numéro de téléphone invalide',
    }),
  otp_verification_token: smsConfig.otpRequired
    ? Joi.string().length(64).required().messages({
      'any.required': 'Vérification SMS requise',
      'string.length': 'Jeton de vérification invalide',
    })
    : Joi.string().allow('', null).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email invalide',
    'any.required': 'L\'email est requis',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Le mot de passe est requis',
  }),
});

const updateProfileSchema = Joi.object({
  nom: Joi.string().min(2).max(100).optional(),
  prenom: Joi.string().min(2).max(100).optional(),
  date_naissance: Joi.date().iso().optional(),
  telephone: Joi.string().optional(),
  contact_urgence: Joi.string().optional(),
  region: Joi.string().max(100).optional().allow(''),
  ville: Joi.string().max(100).optional().allow(''),
  langue: Joi.string().max(5).optional(),
  allergies: Joi.array().items(Joi.string()).optional(),
  pathologies: Joi.array().items(Joi.string()).optional(),
  preferences_notification: Joi.object().optional(),
  consentement_recherche: Joi.boolean().optional(),
});

const parametresVieSchema = Joi.object({
  heure_reveil: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().messages({
    'string.pattern.base': 'Format heure invalide (HH:MM)',
  }),
  heure_coucher: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().messages({
    'string.pattern.base': 'Format heure invalide (HH:MM)',
  }),
  horaires_repas: Joi.object({
    petit_dejeuner: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
    dejeuner: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
    diner: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  }).optional(),
});

const traitementSchema = Joi.object({
  nom_medicament: Joi.string().required().messages({
    'any.required': 'Le nom du médicament est requis',
  }),
  dosage: Joi.string().optional(),
  forme: Joi.string().valid('comprime', 'gelule', 'sirop', 'injection', 'patch', 'gouttes', 'pommade', 'suppositoire', 'inhalateur', 'autre').optional(),
  frequence: Joi.string().optional(),
  instructions: Joi.string().optional(),
  date_debut: Joi.date().iso().optional(),
  date_fin: Joi.date().iso().optional(),
  horaires_prise: Joi.array().items(
    Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
  ).optional(),
});

const confirmerPriseSchema = Joi.object({
  statut: Joi.string().valid('pris', 'oublie', 'reporte').required().messages({
    'any.required': 'Le statut est requis',
    'any.only': 'Statut invalide (pris, oublie, reporte)',
  }),
  date_heure_reelle: Joi.date().iso().optional(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email invalide',
    'any.required': "L'email est requis",
  }),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Le token est requis',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
    'any.required': 'Le mot de passe est requis',
  }),
});

const otpSendSchema = Joi.object({
  telephone: Joi.string().min(9).required().messages({
    'any.required': 'Le téléphone est requis',
    'string.min': 'Numéro de téléphone invalide',
  }),
  usage: Joi.string().valid('register', 'reset_password').required().messages({
    'any.required': 'Usage requis',
    'any.only': 'Usage invalide',
  }),
});

const otpVerifySchema = Joi.object({
  telephone: Joi.string().min(9).required().messages({
    'any.required': 'Le téléphone est requis',
  }),
  code: Joi.string().min(4).max(8).required().messages({
    'any.required': 'Le code est requis',
  }),
  usage: Joi.string().valid('register', 'reset_password').required(),
});

const resetPasswordSmsSchema = Joi.object({
  telephone: Joi.string().min(9).required().messages({
    'any.required': 'Le téléphone est requis',
  }),
  otp_verification_token: Joi.string().length(64).required().messages({
    'any.required': 'Vérification SMS requise',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
    'any.required': 'Le mot de passe est requis',
  }),
});

const avisSchema = Joi.object({
  cible_type: Joi.string().valid('etablissement', 'medecin').required(),
  cible_id: Joi.string().uuid().required(),
  note: Joi.number().integer().min(1).max(5).required(),
  commentaire: Joi.string().max(1000).optional().allow(''),
});

const messageSchema = Joi.object({
  contenu: Joi.string().min(1).max(2000).required(),
});

const conversationSchema = Joi.object({
  sujet: Joi.string().max(255).optional(),
  message_initial: Joi.string().max(2000).optional(),
});

const changePasswordSchema = Joi.object({
  current_password: Joi.string().required().messages({
    'any.required': 'Le mot de passe actuel est requis',
  }),
  new_password: Joi.string().min(8).required().messages({
    'string.min': 'Le nouveau mot de passe doit contenir au moins 8 caractères',
    'any.required': 'Le nouveau mot de passe est requis',
  }),
});

const deleteAccountSchema = Joi.object({
  password: Joi.string().required().messages({
    'any.required': 'Le mot de passe est requis pour confirmer la suppression',
  }),
  confirmation: Joi.string().valid('SUPPRIMER MON COMPTE').required().messages({
    'any.only': 'Saisissez exactement : SUPPRIMER MON COMPTE',
    'any.required': 'Confirmation requise',
  }),
});

const inscriptionStatutSchema = Joi.object({
  email: Joi.string().email().required(),
  reference: Joi.string().uuid().required().messages({
    'any.required': 'La référence de demande est requise',
    'string.guid': 'Référence de demande invalide',
  }),
});

const consentSchema = Joi.object({
  consentement_recherche: Joi.boolean().required(),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  parametresVieSchema,
  traitementSchema,
  confirmerPriseSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resetPasswordSmsSchema,
  otpSendSchema,
  otpVerifySchema,
  avisSchema,
  messageSchema,
  conversationSchema,
  changePasswordSchema,
  deleteAccountSchema,
  inscriptionStatutSchema,
  consentSchema,
};
