const fs = require('fs');
const { Fichier, InscriptionProfessionnel } = require('../models');
const { buildDocumentVerificationPrompt } = require('../config/ai-prompts');
const { getPays } = require('../config/registration-countries');
const { callGemini } = require('../utils/gemini-client');
const { DOC_LABELS } = require('./inscription.service');
const { getFichierAbsolutePath } = require('./fichier.service');

const mimeToGemini = (mime) => {
  if (mime === 'application/pdf') return 'application/pdf';
  if (mime === 'image/png') return 'image/png';
  if (mime === 'image/webp') return 'image/webp';
  return 'image/jpeg';
};

const SOURCES_OFFICIELLES = getPays('CM').sources_verification || [];

const sourcesPourPays = (paysCode) => {
  const pays = getPays(paysCode);
  return pays.sources_verification || SOURCES_OFFICIELLES;
};

/**
 * Première passe IA sur les documents d'une inscription.
 * Ne remplace JAMAIS la vérification humaine (ONMC / CNOM / ANS / MINSANTE…).
 */
const preVerifierInscription = async (inscriptionId) => {
  const inscription = await InscriptionProfessionnel.findByPk(inscriptionId);
  if (!inscription) {
    const error = new Error('Inscription non trouvée');
    error.statusCode = 404;
    throw error;
  }

  const paysCode = inscription.pays
    || inscription.donnees?.pays
    || 'CM';
  const paysCfg = getPays(paysCode);
  const sources = sourcesPourPays(paysCode);
  const ordreCfg = paysCfg.ordre?.[inscription.type_profil];
  const sourcesHint = sources.map((s) => s.nom).join(' · ');
  const prompt = buildDocumentVerificationPrompt(paysCfg.label, sourcesHint);

  const docs = inscription.documents || [];
  if (!docs.length) {
    return {
      verdict_global: 'insuffisant',
      message: 'Aucun document à analyser — demandez au professionnel de compléter son dossier.',
      analyses: [],
      pays: paysCode,
      sources_officielles: sources,
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error('GEMINI_API_KEY manquante — pré-vérification IA indisponible');
    error.statusCode = 503;
    throw error;
  }

  const dossierCtx = {
    pays: paysCode,
    pays_label: paysCfg.label,
    type_profil: inscription.type_profil,
    nom: inscription.nom,
    prenom: inscription.prenom,
    nom_structure: inscription.nom_structure,
    numero_ordre: inscription.numero_ordre,
    numero_ordre_attendu: ordreCfg
      ? {
        label: ordreCfg.label,
        hint: ordreCfg.hint,
        example: ordreCfg.example || null,
        format: ordreCfg.pattern ? String(ordreCfg.pattern) : null,
      }
      : null,
    numero_agrement: inscription.numero_agrement,
    specialite: inscription.specialite,
    email: inscription.email,
    ville: inscription.ville,
    region: inscription.region,
  };

  const analyses = [];

  for (const doc of docs.slice(0, 4)) {
    const fichier = await Fichier.findByPk(doc.fichier_id);
    if (!fichier) {
      analyses.push({
        type: doc.type,
        label: DOC_LABELS[doc.type] || doc.type,
        erreur: 'Fichier introuvable en base',
      });
      continue;
    }

    const localPath = await getFichierAbsolutePath(doc.fichier_id);
    if (!localPath) {
      analyses.push({
        type: doc.type,
        label: DOC_LABELS[doc.type] || doc.type,
        erreur: 'Fichier absent du disque — re-téléversement requis',
      });
      continue;
    }

    const buffer = fs.readFileSync(localPath);
    const b64 = buffer.toString('base64');
    const mime = mimeToGemini(fichier.mime_type);

    const contents = [{
      role: 'user',
      parts: [
        {
          text: `${prompt}\n\nDossier déclaré :\n${JSON.stringify(dossierCtx, null, 2)}\n\nType de document attendu : ${doc.type} (${DOC_LABELS[doc.type] || doc.type})`,
        },
        { inline_data: { mime_type: mime, data: b64 } },
      ],
    }];

    try {
      const raw = await callGemini({
        apiKey,
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
        contents,
      });
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      let parsed;
      try {
        parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
      } catch {
        parsed = {
          score_confiance: 0,
          verdict_ia: 'insuffisant',
          alertes: ['Réponse IA non JSON'],
          brut: raw.slice(0, 500),
        };
      }
      analyses.push({
        type: doc.type,
        label: DOC_LABELS[doc.type] || doc.type,
        fichier_id: doc.fichier_id,
        ...parsed,
      });
    } catch (err) {
      analyses.push({
        type: doc.type,
        label: DOC_LABELS[doc.type] || doc.type,
        erreur: err.message,
      });
    }
  }

  const verdicts = analyses.map((a) => a.verdict_ia).filter(Boolean);
  let verdict_global = 'acceptable_pour_revue_humaine';
  if (verdicts.includes('suspect') || analyses.some((a) => a.erreur)) {
    verdict_global = 'suspect';
  } else if (verdicts.every((v) => v === 'insuffisant') || !verdicts.length) {
    verdict_global = 'insuffisant';
  }

  const avertissement = paysCode === 'FR'
    ? 'Pré-analyse IA uniquement. Authentification légale = CNOM, Annuaire Santé (RPPS), ANS, ou contact direct avec l\'autorité émettrice.'
    : 'Pré-analyse IA uniquement. Authentification légale = ONMC, MINSANTE (QR scolarite.minsante.cm), '
      + 'équivalence MINESUP (equivalence.cm), ou contact direct avec l\'autorité émettrice.';

  const rapport = {
    verdict_global,
    pays: paysCode,
    analyse_at: new Date().toISOString(),
    analyses,
    sources_officielles: sources,
    avertissement,
  };

  inscription.donnees = {
    ...(inscription.donnees || {}),
    ai_verification: rapport,
  };
  await inscription.save();

  return rapport;
};

module.exports = {
  preVerifierInscription,
  SOURCES_OFFICIELLES,
  sourcesPourPays,
};
