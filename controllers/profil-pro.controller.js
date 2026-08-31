const affiliationService = require('../services/medecin-affiliation.service');
const parcoursService = require('../services/parcours-professionnel.service');
const membreEquipeService = require('../services/membre-equipe.service');

const listerAffiliationsMedecin = async (req, res, next) => {
  try {
    const affiliations = await affiliationService.listerPourMedecin(req.medecin.id, {
      inclure_terminees: req.query.inclure_terminees === 'true',
    });
    res.json({ success: true, data: affiliations });
  } catch (error) {
    next(error);
  }
};

const creerCabinet = async (req, res, next) => {
  try {
    const affiliation = await affiliationService.creerCabinetPrive(req.medecin.id, req.body);
    res.status(201).json({ success: true, data: affiliation });
  } catch (error) {
    next(error);
  }
};

const repondreAffiliation = async (req, res, next) => {
  try {
    const accepter = req.body.accepter !== false;
    const affiliation = await affiliationService.repondreInvitation(
      req.medecin.id,
      req.params.id,
      accepter,
    );
    res.json({ success: true, data: affiliation });
  } catch (error) {
    next(error);
  }
};

const terminerAffiliation = async (req, res, next) => {
  try {
    const affiliation = await affiliationService.terminerAffiliation(req.medecin.id, req.params.id);
    res.json({ success: true, data: affiliation });
  } catch (error) {
    next(error);
  }
};

const mettreAJourAffiliation = async (req, res, next) => {
  try {
    const affiliation = await affiliationService.mettreAJourAffiliation(
      req.medecin.id,
      req.params.id,
      req.body,
    );
    res.json({ success: true, data: affiliation });
  } catch (error) {
    next(error);
  }
};

const inviterMedecinStructure = async (req, res, next) => {
  try {
    const affiliation = await affiliationService.inviterMedecin(req.etablissement.id, req.body);
    res.status(201).json({ success: true, data: affiliation });
  } catch (error) {
    next(error);
  }
};

const listerAffiliationsStructure = async (req, res, next) => {
  try {
    const affiliations = await affiliationService.listerPourEtablissement(req.etablissement.id);
    res.json({ success: true, data: affiliations });
  } catch (error) {
    next(error);
  }
};

const listerParcours = async (req, res, next) => {
  try {
    const parcours = await parcoursService.listerPourMedecin(req.medecin.id);
    res.json({ success: true, data: parcours });
  } catch (error) {
    next(error);
  }
};

const creerParcours = async (req, res, next) => {
  try {
    const entry = await parcoursService.creer(req.medecin.id, req.body);
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

const mettreAJourParcours = async (req, res, next) => {
  try {
    const entry = await parcoursService.mettreAJour(req.medecin.id, req.params.id, req.body);
    res.json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

const supprimerParcours = async (req, res, next) => {
  try {
    await parcoursService.supprimer(req.medecin.id, req.params.id);
    res.json({ success: true, message: 'Entrée supprimée' });
  } catch (error) {
    next(error);
  }
};

const listerMembresEquipe = async (req, res, next) => {
  try {
    const membres = await membreEquipeService.listerPourEtablissement(req.etablissement.id);
    res.json({ success: true, data: membres });
  } catch (error) {
    next(error);
  }
};

const creerMembreEquipe = async (req, res, next) => {
  try {
    const membre = await membreEquipeService.creer(req.etablissement.id, req.body);
    res.status(201).json({ success: true, data: membre });
  } catch (error) {
    next(error);
  }
};

const mettreAJourMembreEquipe = async (req, res, next) => {
  try {
    const membre = await membreEquipeService.mettreAJour(req.etablissement.id, req.params.id, req.body);
    res.json({ success: true, data: membre });
  } catch (error) {
    next(error);
  }
};

const supprimerMembreEquipe = async (req, res, next) => {
  try {
    await membreEquipeService.supprimer(req.etablissement.id, req.params.id);
    res.json({ success: true, message: 'Membre supprimé' });
  } catch (error) {
    next(error);
  }
};

const listerMembresEquipePublic = async (req, res, next) => {
  try {
    const membres = await membreEquipeService.listerPublic(req.params.id);
    res.json({ success: true, data: membres });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listerAffiliationsMedecin,
  creerCabinet,
  repondreAffiliation,
  terminerAffiliation,
  mettreAJourAffiliation,
  inviterMedecinStructure,
  listerAffiliationsStructure,
  listerParcours,
  creerParcours,
  mettreAJourParcours,
  supprimerParcours,
  listerMembresEquipe,
  creerMembreEquipe,
  mettreAJourMembreEquipe,
  supprimerMembreEquipe,
  listerMembresEquipePublic,
};
