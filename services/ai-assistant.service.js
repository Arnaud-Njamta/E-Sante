const {
  buildSystemPrompt, DOCTOR_KNOWLEDGE_ACK,
} = require('../config/ai-prompts');
const { EMERGENCY_REPLY, EMERGENCY } = require('../config/cameroon-health');
const { VIOLENCE_AWARENESS } = require('../config/ai-first-aid');
const { matchSpecialties } = require('../config/ai-specialty-map');
const {
  extractDoctorTeaching, addDoctorKnowledge, getKnowledgeBlock,
} = require('../services/ai-knowledge.service');
const medecinService = require('./medecin.service');
const rendezvousService = require('./rendezvous.service');
const { callGemini } = require('../utils/gemini-client');

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

const buildUserContext = (userContext = {}) => {
  const parts = [];
  if (userContext.role) parts.push(`Profil connecté : ${userContext.role}`);
  if (userContext.medecinName) parts.push(`Médecin : ${userContext.medecinName}`);
  if (userContext.specialite) parts.push(`Spécialité : ${userContext.specialite}`);
  if (userContext.ville) parts.push(`Ville : ${userContext.ville}`);
  if (userContext.latitude != null && userContext.longitude != null) {
    parts.push(`Position GPS patient : ${userContext.latitude}, ${userContext.longitude} (prioriser les soignants et établissements les plus proches)`);
  }
  if (userContext.allergies?.length) parts.push(`Allergies connues : ${userContext.allergies.join(', ')}`);
  if (userContext.pathologies?.length) parts.push(`Pathologies connues : ${userContext.pathologies.join(', ')}`);
  if (!parts.length) return '';
  return `\n\n[Contexte utilisateur]\n${parts.join('\n')}`;
};

const toGeminiHistory = (messages = []) => {
  const mapped = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-14)
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  let start = 0;
  while (start < mapped.length && mapped[start].role === 'model') {
    start += 1;
  }
  return mapped.slice(start);
};

const EMERGENCY_PATTERNS = [
  /difficult[eé].*respir/i,
  /mal.*respir/i,
  /(?:ne\s+)?(?:peux|peut)\s+pas\s+respir/i,
  /essouffl/i,
  /douleur.*(?:poitrine|thorax)/i,
  /perte.*conscience/i,
  /(?:ne\s+)?(?:peut|peux)\s+pas\s+bouger/i,
  /convuls/i,
  /h[eé]morragie/i,
  /saigne.*abond/i,
  /avc|accident\s+vasculaire/i,
  /paralys/i,
  /arr[eê]t.*cardiaque/i,
  /ne\s+respire\s+plus/i,
];

const ACCIDENT_PATTERNS = [
  /accident/i,
  /collision/i,
  /renvers[eé]/i,
  /mot[eo]/i,
  /voiture/i,
  /moto/i,
  /choc/i,
  /t[eé]moin/i,
  /bless[eé]/i,
  /route/i,
  /chute.*(?:lourd|grave|haut)/i,
];

const VIOLENCE_PATTERNS = [
  /violence/i,
  /f[eé]minicide/i,
  /agress/i,
  /frapp/i,
  /bat.*(?:moi|elle)/i,
  /conjug/i,
  /menace/i,
  /viol\b/i,
];

const detectEmergency = (message) => {
  const text = message.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  return EMERGENCY_PATTERNS.some((p) => p.test(text));
};

const detectAccident = (message) => {
  const text = message.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  return ACCIDENT_PATTERNS.some((p) => p.test(text));
};

const detectViolence = (message) => {
  const text = message.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  return VIOLENCE_PATTERNS.some((p) => p.test(text));
};

const buildListerGeo = (userContext = {}) => {
  const { latitude, longitude, radius_km } = userContext;
  if (latitude != null && longitude != null) {
    return { latitude, longitude, nearby: true, radius_km: radius_km || 30 };
  }
  return {};
};

const buildMedecinCatalog = async (userContext = {}) => {
  try {
    const { medecins } = await medecinService.lister({ limit: 30, ...buildListerGeo(userContext) });
    return medecins.map((m) => (
      `- ID ${m.id} : Dr ${m.prenom} ${m.nom} — ${m.specialite}`
      + `${m.etablissement ? ` (${m.etablissement.nom}, ${m.etablissement.ville || 'Cameroun'})` : ''}`
      + ` — note ${m.note_moyenne}/5`
    )).join('\n');
  } catch {
    return '';
  }
};

const parseRecommendations = (reply) => {
  const jsonMatch = reply.match(/```json\s*([\s\S]*?)\s*```/);
  let cleanReply = reply;
  let recommandations = [];

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      recommandations = (parsed.recommandations || []).filter((r) => r.id && r.motif && String(r.id).length >= 8);
      cleanReply = reply.replace(jsonMatch[0], '').trim();
    } catch { /* ignore malformed json */ }
  }

  return { cleanReply, recommandations };
};

const enrichRecommendations = async (rawRecs) => {
  const enriched = [];
  for (const rec of rawRecs.slice(0, 2)) {
    try {
      const m = await medecinService.getById(rec.id);
      const creneaux = await getUpcomingSlots(m.id, 2);
      enriched.push({
        id: m.id,
        nom: `Dr ${m.prenom} ${m.nom}`,
        specialite: m.specialite,
        motif: rec.motif,
        note: m.note_moyenne,
        etablissement: m.etablissement?.nom,
        ville: m.etablissement?.ville,
        distance_km: m.distance_km,
        accepte_teleconsultation: m.accepte_teleconsultation,
        tarif_fcfa: m.tarif_consultation_fcfa,
        creneaux,
      });
    } catch { /* skip invalid id */ }
  }
  return enriched;
};

const getUpcomingSlots = async (medecinId, maxSlots = 2) => {
  const slots = [];
  const today = new Date();

  for (let d = 0; d < 7 && slots.length < maxSlots; d += 1) {
    const date = new Date(today);
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().slice(0, 10);
    try {
      const { creneaux, tarif, commission } = await rendezvousService.getCreneauxDisponibles(medecinId, dateStr);
      creneaux.slice(0, maxSlots - slots.length).forEach((c) => {
        slots.push({
          date: dateStr,
          heure_debut: c.debut,
          heure_fin: c.fin,
          tarif_fcfa: tarif,
          commission,
        });
      });
    } catch { /* skip */ }
  }
  return slots;
};

const fallbackRecommendations = async (message, userContext = {}) => {
  const specialties = matchSpecialties(message);
  if (!specialties.length) return [];

  try {
    const { medecins } = await medecinService.lister({ limit: 40, ...buildListerGeo(userContext) });
    const matched = medecins.filter((m) => specialties.some((s) => (
      m.specialite?.toLowerCase().includes(s.toLowerCase().split('-')[0])
    )));
    return Promise.all(
      matched.slice(0, 2).map(async (m) => {
        const creneaux = await getUpcomingSlots(m.id, 2);
        return {
          id: m.id,
          nom: `Dr ${m.prenom} ${m.nom}`,
          specialite: m.specialite,
          motif: `Spécialiste en ${m.specialite}`,
          note: m.note_moyenne,
          etablissement: m.etablissement?.nom,
          ville: m.etablissement?.ville,
          distance_km: m.distance_km,
          accepte_teleconsultation: m.accepte_teleconsultation,
          tarif_fcfa: m.tarif_consultation_fcfa,
          creneaux,
        };
      }),
    );
  } catch {
    return [];
  }
};

const getFirstAidVideos = () => [];

const chat = async ({ message, history = [], userContext = {} }) => {
  if (!message?.trim()) {
    const error = new Error('Message requis');
    error.statusCode = 400;
    throw error;
  }

  const trimmed = message.trim();

  if (userContext.role === 'medecin') {
    const teaching = extractDoctorTeaching(trimmed);
    if (teaching) {
      addDoctorKnowledge({
        content: teaching,
        medecinId: userContext.medecinId,
        medecinName: userContext.medecinName,
        specialite: userContext.specialite,
      });
      return {
        reply: `${DOCTOR_KNOWLEDGE_ACK}\n\n> « ${teaching.slice(0, 300)}${teaching.length > 300 ? '…' : ''} »`,
        model: 'doctor-knowledge',
        doctorMode: true,
      };
    }
  }

  if (detectEmergency(trimmed) || detectAccident(trimmed)) {
    return {
      reply: EMERGENCY_REPLY,
      model: 'emergency-rules',
      urgent: true,
      recommandations: [],
      videos: [],
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error('Clé API Gemini non configurée (GEMINI_API_KEY dans .env)');
    error.statusCode = 503;
    throw error;
  }

  const [medecinCatalog, doctorKnowledge] = await Promise.all([
    buildMedecinCatalog(userContext),
    Promise.resolve(getKnowledgeBlock()),
  ]);

  const systemInstruction = buildSystemPrompt({
    medecinCatalog,
    doctorKnowledge,
    userRole: userContext.role || 'patient',
  });

  const contextBlock = buildUserContext(userContext);
  const userMessage = `${trimmed}${contextBlock}`;
  const prior = toGeminiHistory(history);
  const contents = [...prior, { role: 'user', parts: [{ text: userMessage }] }];

  try {
    const rawReply = await callGemini({
      apiKey,
      model: MODEL,
      systemInstruction,
      contents,
    });

    const { cleanReply, recommandations: parsedRecs } = parseRecommendations(rawReply);
    let recommandations = await enrichRecommendations(parsedRecs);
    if (!recommandations.length) {
      recommandations = await fallbackRecommendations(trimmed, userContext);
    }

    const violence = detectViolence(trimmed);

    let reply = cleanReply;
    if (violence && !reply.includes('117')) {
      reply += `\n\n🛡️ **Protection & écoute**\n${VIOLENCE_AWARENESS.message}`;
    }

    return {
      reply,
      model: MODEL,
      recommandations,
      videos: [],
      violence: violence || undefined,
    };
  } catch (err) {
    const apiMsg = err.message || '';
    if (process.env.NODE_ENV === 'development') {
      console.error('Erreur Gemini:', apiMsg);
    }

    const violence = detectViolence(trimmed);
    const fallbackReply = buildOfflineFallback(trimmed, violence);

    return {
      reply: fallbackReply,
      model: 'offline-fallback',
      recommandations: await fallbackRecommendations(trimmed, userContext),
      videos: [],
      violence: violence || undefined,
      offline: true,
    };
  }
};

const buildOfflineFallback = (message, violence) => {
  const lines = [
    '⚠️ L\'assistant IA est momentanément indisponible. Voici une réponse de secours :',
    '',
    `🆘 **Urgences Cameroun** : ${EMERGENCY.national.number} (SAMU) · 117 · 112`,
    'En cas de danger immédiat, contactez les services d\'urgence sans attendre.',
  ];
  if (violence) {
    lines.push('', `🛡️ ${VIOLENCE_AWARENESS.message}`);
  }
  lines.push('', '_Cette réponse automatique ne remplace pas un avis médical. Réessayez l\'assistant dans quelques instants._');
  return lines.join('\n');
};

const healthCheck = () => ({
  configured: !!process.env.GEMINI_API_KEY,
  model: MODEL,
  available: !!process.env.GEMINI_API_KEY,
  message: process.env.GEMINI_API_KEY
    ? 'Assistant IA opérationnel'
    : 'Ajoutez GEMINI_API_KEY dans le fichier .env du serveur pour activer l\'IA complète',
});

const bookRdv = async (patientId, payload) => {
  if (!patientId) {
    const error = new Error('Réservé aux patients connectés');
    error.statusCode = 403;
    throw error;
  }
  const { POLITIQUE_CONFIDENTIALITE_VERSION } = require('../utils/constants');
  return rendezvousService.creerRdv(patientId, {
    ...payload,
    consentement_politique: true,
    consentement_partage_carnet: true,
    consentement_teleconsultation: payload.type_consultation === 'teleconsultation' ? true : undefined,
    politique_version: POLITIQUE_CONFIDENTIALITE_VERSION,
  });
};

module.exports = { chat, healthCheck, bookRdv };
