const { ParcoursProfessionnel } = require('../models');

const formatParcours = (row) => (row.toJSON ? row.toJSON() : { ...row });

const listerPourMedecin = async (medecinId) => {
  const rows = await ParcoursProfessionnel.findAll({
    where: { medecin_id: medecinId },
    order: [['ordre', 'ASC'], ['date_debut', 'DESC'], ['createdAt', 'DESC']],
  });
  return rows.map(formatParcours);
};

const creer = async (medecinId, data) => {
  const count = await ParcoursProfessionnel.count({ where: { medecin_id: medecinId } });
  const entry = await ParcoursProfessionnel.create({
    medecin_id: medecinId,
    type: data.type || 'experience',
    titre: data.titre,
    organisme: data.organisme || null,
    lieu: data.lieu || null,
    date_debut: data.date_debut || null,
    date_fin: data.date_fin || null,
    description: data.description || null,
    actuel: !!data.actuel,
    ordre: data.ordre ?? count,
  });
  return formatParcours(entry);
};

const mettreAJour = async (medecinId, id, data) => {
  const entry = await ParcoursProfessionnel.findOne({ where: { id, medecin_id: medecinId } });
  if (!entry) {
    const error = new Error('Entrée de parcours non trouvée');
    error.statusCode = 404;
    throw error;
  }
  const allowed = ['type', 'titre', 'organisme', 'lieu', 'date_debut', 'date_fin', 'description', 'actuel', 'ordre'];
  allowed.forEach((k) => { if (data[k] !== undefined) entry[k] = data[k]; });
  await entry.save();
  return formatParcours(entry);
};

const supprimer = async (medecinId, id) => {
  const entry = await ParcoursProfessionnel.findOne({ where: { id, medecin_id: medecinId } });
  if (!entry) {
    const error = new Error('Entrée de parcours non trouvée');
    error.statusCode = 404;
    throw error;
  }
  await entry.destroy();
  return { success: true };
};

module.exports = {
  listerPourMedecin,
  creer,
  mettreAJour,
  supprimer,
  formatParcours,
};
