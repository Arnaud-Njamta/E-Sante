const errorMiddleware = (err, req, res, next) => {
  console.error('Erreur:', err.message);

  if (err.name === 'MulterError') {
    const messages = {
      LIMIT_FILE_SIZE: 'Fichier trop volumineux (max 10 Mo)',
      LIMIT_UNEXPECTED_FILE: 'Champ fichier incorrect — réessayez',
      LIMIT_FILE_COUNT: 'Un seul fichier à la fois',
    };
    const message = messages[err.code] || err.message;
    return res.status(400).json({ success: false, message });
  }

  if (err.message?.includes('Format non supporté')) {
    return res.status(400).json({ success: false, message: err.message });
  }

  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors,
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'Cette ressource existe déjà',
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token invalide',
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Erreur interne du serveur',
  });
};

module.exports = errorMiddleware;
