const inscriptionService = require('../services/inscription.service');
const documentVerificationService = require('../services/document-verification.service');
const { SPECIALITES_BY_PROFIL, PROFESSION_LABELS } = require('../config/cameroon-specialties');
const { listPays, getPays, PAYS_INSCRIPTION } = require('../config/registration-countries');

const registerProfessionnel = async (req, res, next) => {
  try {
    let payload = req.body;
    if (typeof req.body?.data === 'string') {
      try {
        const raw = req.body.data.replace(/^\uFEFF/, '').trim();
        payload = JSON.parse(raw);
      } catch (parseErr) {
        const error = new Error('Données d\'inscription invalides — réessayez depuis le formulaire');
        error.statusCode = 400;
        throw error;
      }
    }
    const files = [];
    if (req.files) {
      Object.entries(req.files).forEach(([fieldname, arr]) => {
        arr.forEach((file) => files.push({ ...file, fieldname }));
      });
    }
    const result = await inscriptionService.creerInscription(payload, files);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getStatut = async (req, res, next) => {
  try {
    const { email, reference } = req.body;
    const statut = await inscriptionService.getStatutDemande(email, reference);
    res.json({ success: true, data: statut });
  } catch (error) {
    next(error);
  }
};

const listerEnAttente = async (req, res, next) => {
  try {
    const inscriptions = await inscriptionService.listerEnAttente();
    res.json({ success: true, data: inscriptions });
  } catch (error) {
    next(error);
  }
};

const valider = async (req, res, next) => {
  try {
    const result = await inscriptionService.validerInscription(req.params.id, {
      valide_par: req.user?.profile?.email || req.user?.id,
      admin: req.user,
      ip: req.ip,
    });
    res.json({ success: true, data: result, message: 'Compte professionnel activé' });
  } catch (error) {
    next(error);
  }
};

const rejeter = async (req, res, next) => {
  try {
    const result = await inscriptionService.rejeterInscription(
      req.params.id,
      req.body.motif_rejet,
      { admin: req.user, ip: req.ip },
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getDocumentsRequis = async (req, res, next) => {
  try {
    const sources_verification_by_pays = {};
    Object.keys(PAYS_INSCRIPTION).forEach((code) => {
      sources_verification_by_pays[code] = getPays(code).sources_verification || [];
    });

    res.json({
      success: true,
      data: {
        documents: inscriptionService.DOCUMENTS_REQUIS,
        documents_optionnels: inscriptionService.DOCUMENTS_OPTIONNELS,
        labels: inscriptionService.DOC_LABELS,
        labels_by_profil: inscriptionService.DOC_LABELS_BY_PROFIL,
        specialites: SPECIALITES_BY_PROFIL,
        professions: PROFESSION_LABELS,
        operateurs_mobile_money: inscriptionService.OPERATEURS_MOBILE_MONEY,
        note_paiement: 'Numéro Mobile Money obligatoire au Cameroun pour recevoir les paiements patients. Optionnel pour les professionnels en France.',
        notes_documents: inscriptionService.NOTES_DOCUMENTS,
        note_documents: 'Consultez le type de compte : soignants (CNI + casier) ou structures (CNI du représentant + agréments MINSANTE).',
        sources_verification: documentVerificationService.SOURCES_OFFICIELLES,
        sources_verification_by_pays,
        pays: listPays(),
      },
    });
  } catch (error) {
    next(error);
  }
};

const preVerifierDocuments = async (req, res, next) => {
  try {
    const rapport = await documentVerificationService.preVerifierInscription(req.params.id);
    res.json({ success: true, data: rapport });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerProfessionnel,
  getStatut,
  listerEnAttente,
  valider,
  rejeter,
  getDocumentsRequis,
  preVerifierDocuments,
};
