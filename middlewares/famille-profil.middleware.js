const { ProfilFamille } = require('../models');

const familleProfilMiddleware = async (req, res, next) => {
  const profilId = req.headers['x-famille-profil-id'];
  if (!profilId || !req.patient) return next();

  try {
    const profil = await ProfilFamille.findOne({
      where: { id: profilId, patient_id: req.patient.id, actif: true },
    });
    if (profil) req.familleProfil = profil;
  } catch {
    // ignore — fallback sur le profil principal
  }
  next();
};

module.exports = familleProfilMiddleware;
