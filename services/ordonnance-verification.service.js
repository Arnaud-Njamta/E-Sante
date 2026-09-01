const fs = require('fs');
const { ORDONNANCE_VERIFICATION_PROMPT } = require('../config/ai-prompts');
const { callGemini } = require('../utils/gemini-client');

const mimeToGemini = (mime) => {
  if (mime === 'application/pdf') return 'application/pdf';
  if (mime === 'image/png' || mime === 'image/x-png') return 'image/png';
  if (mime === 'image/webp') return 'image/webp';
  return 'image/jpeg';
};

const VERDICTS_PHARMACIE_OK = new Set(['valide', 'acceptable', 'acceptable_pour_revue_humaine']);

const parseJsonResponse = (raw) => {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  try {
    return JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch {
    return null;
  }
};

const fallbackAnalyse = () => ({
  score_confiance: 45,
  verdict: 'acceptable',
  est_ordonnance: true,
  medecin: null,
  date_ordonnance: null,
  medicaments: [],
  alertes: ['Analyse IA indisponible — un pharmacien validera manuellement votre ordonnance'],
  resume: 'Ordonnance reçue — validation manuelle requise en pharmacie',
  mode: 'fallback',
});

/**
 * Pré-contrôle IA d'une ordonnance scannée / photographiée.
 * @param {Buffer} buffer
 * @param {string} mimetype
 */
const analyserOrdonnance = async (buffer, mimetype = 'image/jpeg') => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !buffer?.length) {
    return fallbackAnalyse();
  }

  const b64 = buffer.toString('base64');
  const mime = mimeToGemini(mimetype);

  const contents = [{
    role: 'user',
    parts: [
      { text: ORDONNANCE_VERIFICATION_PROMPT },
      { inline_data: { mime_type: mime, data: b64 } },
    ],
  }];

  try {
    const raw = await callGemini({
      apiKey,
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      contents,
    });
    const parsed = parseJsonResponse(raw);
    if (!parsed) {
      return { ...fallbackAnalyse(), alertes: ['Réponse IA non structurée — validation manuelle'] };
    }
    return {
      ...parsed,
      mode: 'gemini',
      analyse_at: new Date().toISOString(),
    };
  } catch (err) {
    return {
      ...fallbackAnalyse(),
      alertes: [`IA temporairement indisponible (${err.message})`, 'Un pharmacien vérifiera votre ordonnance'],
    };
  }
};

const analyserFichier = async (filePath, mimetype) => {
  const buffer = fs.readFileSync(filePath);
  return analyserOrdonnance(buffer, mimetype);
};

const estAcceptablePharmacie = (verification) => {
  if (!verification) return false;
  const v = (verification.verdict || verification.verdict_ia || '').toLowerCase();
  if (VERDICTS_PHARMACIE_OK.has(v)) return true;
  if (v === 'douteux' && (verification.score_confiance || 0) >= 40) return true;
  return false;
};

module.exports = {
  analyserOrdonnance,
  analyserFichier,
  estAcceptablePharmacie,
  VERDICTS_PHARMACIE_OK,
};
