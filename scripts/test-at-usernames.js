/**
 * Teste plusieurs usernames avec la même clé API (diagnostic 401).
 * Usage: node scripts/test-at-usernames.js
 */
require('dotenv').config({ override: true });
const https = require('https');

const k = (process.env.AFRICAS_TALKING_API_KEY || '').trim();
const candidates = [
  process.env.AFRICAS_TALKING_USERNAME,
  'Arnaud',
  'arnaud',
  'Djamsante',
  'djamsante',
  'sandbox',
].filter(Boolean);

const unique = [...new Set(candidates.map((u) => u.trim()))];
const agent = new https.Agent({ rejectUnauthorized: false });

const hit = (host, username) => new Promise((resolve) => {
  const req = https.request({
    hostname: host,
    path: `/version1/user?username=${encodeURIComponent(username)}`,
    method: 'GET',
    agent,
    headers: { apiKey: k, Accept: 'application/json' },
  }, (res) => {
    let d = '';
    res.on('data', (c) => { d += c; });
    res.on('end', () => resolve({ host, username, status: res.statusCode, body: d.slice(0, 120) }));
  });
  req.on('error', (e) => resolve({ host, username, status: 0, body: e.message }));
  req.end();
});

(async () => {
  console.log('Clé API longueur:', k.length);
  for (const u of unique) {
    const live = await hit('api.africastalking.com', u);
    console.log(`LIVE  user=${u} → HTTP ${live.status} ${live.body}`);
  }
})();
