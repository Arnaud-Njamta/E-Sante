const { MembreEquipeEtablissement } = require('../models');
const { parseJsonField } = require('../utils/helpers');

const formatMembre = (row) => {
  const data = row.toJSON ? row.toJSON() : { ...row };
  return {
    ...data,
    competences: parseJsonField(data.competences, []),
  };
};

const listerPourEtablissement = async (etablissementId) => {
  const rows = await MembreEquipeEtablissement.findAll({
    where: { etablissement_id: etablissementId },
    order: [['ordre', 'ASC'], ['nom', 'ASC']],
  });
  return rows.map(formatMembre);
};

const listerPublic = async (etablissementId) => {
  const rows = await MembreEquipeEtablissement.findAll({
    where: { etablissement_id: etablissementId, actif: true },
    order: [['ordre', 'ASC'], ['nom', 'ASC']],
  });
  return rows.map(formatMembre);
};

const creer = async (etablissementId, data) => {
  const count = await MembreEquipeEtablissement.count({ where: { etablissement_id: etablissementId } });
  const membre = await MembreEquipeEtablissement.create({
    etablissement_id: etablissementId,
    nom: data.nom,
    prenom: data.prenom,
    role: data.role || 'Pharmacien',
    email: data.email || null,
    telephone: data.telephone || null,
    bio: data.bio || null,
    competences: data.competences || [],
    ordre: data.ordre ?? count,
  });
  return formatMembre(membre);
};

const mettreAJour = async (etablissementId, id, data) => {
  const membre = await MembreEquipeEtablissement.findOne({
    where: { id, etablissement_id: etablissementId },
  });
  if (!membre) {
    const error = new Error('Membre non trouvé');
    error.statusCode = 404;
    throw error;
  }
  const allowed = ['nom', 'prenom', 'role', 'email', 'telephone', 'bio', 'competences', 'actif', 'ordre'];
  allowed.forEach((k) => { if (data[k] !== undefined) membre[k] = data[k]; });
  await membre.save();
  return formatMembre(membre);
};

const supprimer = async (etablissementId, id) => {
  const membre = await MembreEquipeEtablissement.findOne({
    where: { id, etablissement_id: etablissementId },
  });
  if (!membre) {
    const error = new Error('Membre non trouvé');
    error.statusCode = 404;
    throw error;
  }
  await membre.destroy();
  return { success: true };
};

module.exports = {
  listerPourEtablissement,
  listerPublic,
  creer,
  mettreAJour,
  supprimer,
  formatMembre,
};
