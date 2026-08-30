const https = require('https');

/** Agent HTTPS — en dev Windows, le magasin de certificats Node peut bloquer Google API */
const geminiHttpsAgent = new https.Agent({
  rejectUnauthorized: process.env.NODE_ENV === 'production'
    && process.env.GEMINI_SSL_INSECURE !== 'true',
});

const FALLBACK_MODELS = [
  'gemini-3.6-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
];

const callGeminiOnce = ({
  apiKey, model, systemInstruction, contents,
}) => new Promise((resolve, reject) => {
  const path = `/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const payload = { contents };
  if (systemInstruction) {
    payload.systemInstruction = { parts: [{ text: systemInstruction }] };
  }
  const body = JSON.stringify(payload);

  const req = https.request({
    hostname: 'generativelanguage.googleapis.com',
    path,
    method: 'POST',
    agent: geminiHttpsAgent,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      let json;
      try {
        json = JSON.parse(data);
      } catch {
        reject(new Error(`Réponse Gemini invalide (HTTP ${res.statusCode})`));
        return;
      }
      if (res.statusCode >= 400) {
        const err = new Error(json.error?.message || `Gemini HTTP ${res.statusCode}`);
        err.statusCode = res.statusCode;
        err.model = model;
        reject(err);
        return;
      }
      const text = (json.candidates?.[0]?.content?.parts || [])
        .map((p) => p.text)
        .filter(Boolean)
        .join('');
      if (!text) {
        const blockReason = json.candidates?.[0]?.finishReason
          || json.promptFeedback?.blockReason;
        reject(new Error(blockReason
          ? `Réponse bloquée (${blockReason})`
          : 'Réponse vide du service IA'));
        return;
      }
      resolve({ text: text.trim(), model });
    });
  });

  req.on('error', (err) => {
    reject(new Error(`Connexion Gemini impossible : ${err.message}`));
  });
  req.setTimeout(90000, () => {
    req.destroy(new Error('Délai dépassé — réessayez'));
  });
  req.write(body);
  req.end();
});

const callGemini = async (opts) => {
  const models = [...new Set([
    opts.model,
    process.env.GEMINI_MODEL,
    ...FALLBACK_MODELS,
  ].filter(Boolean))];

  let lastError;
  for (let i = 0; i < models.length; i += 1) {
    const model = models[i];
    try {
      const result = await callGeminiOnce({ ...opts, model });
      return result.text;
    } catch (err) {
      lastError = err;
      const isLast = i === models.length - 1;
      const retryable = !isLast && (
        err.statusCode === 404
        || err.statusCode === 429
        || /certificate|fetch failed|ECONNRESET|ETIMEDOUT|no longer available|not found/i.test(err.message)
      );
      if (!retryable) throw err;
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[Gemini] ${model} indisponible → essai ${models[i + 1]} (${err.message.slice(0, 100)})`);
      }
    }
  }
  throw lastError || new Error('Service IA indisponible');
};

module.exports = { callGemini };
