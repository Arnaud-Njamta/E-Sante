const Joi = require('joi');

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
  telephone: Joi.string().optional(),
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
  allergies: Joi.array().items(Joi.string()).optional(),
  pathologies: Joi.array().items(Joi.string()).optional(),
  preferences_notification: Joi.object().optional(),
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
};
