/**
 * Diagnostic production — à lancer sur le VPS : node scripts/diagnose-production.js
 */
require('dotenv').config({ override: true });

const port = process.env.PORT || 3000;
const localBase = `http://127.0.0.1:${port}/api`;
const publicBase = process.env.API_PUBLIC_URL || null;

const parseJsonSafe = async (res) => {
  const text = await res.text();
  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text: text.slice(0, 120) };
  }
};

(async () => {
  console.log('=== Diagnostic DjamSanté ===\n');
  console.log('Local API:', localBase);
  console.log('Public API:', publicBase || '(non défini)');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('PM2_INSTANCE:', process.env.NODE_APP_INSTANCE ?? 'non défini');
  console.log('DB_POOL_MAX:', process.env.DB_POOL_MAX || '15 (défaut)');
  console.log('PM2_INSTANCES:', process.env.PM2_INSTANCES || '1 (défaut fork)\n');

  if (process.env.PM2_INSTANCES === 'max') {
    console.warn('⚠️  PM2_INSTANCES=max peut saturer le VPS. Recommandé : PM2_INSTANCES=1\n');
  }

  let healthOk = false;
  for (const [label, base] of [['Local', localBase], ['Public', publicBase]].filter(([, b]) => b)) {
    try {
      const healthRes = await fetch(`${base}/health`);
      const { json, text } = await parseJsonSafe(healthRes);
      if (json?.success) {
        console.log(`Health ${label} HTTP ${healthRes.status}`, JSON.stringify(json));
        if (label === 'Local') healthOk = true;
      } else {
        console.warn(`Health ${label} HTTP ${healthRes.status} — réponse non-JSON:`, text);
        if (label === 'Public') {
          console.warn('  → Vérifiez Nginx : location /api doit proxy_pass vers http://127.0.0.1:3000');
        }
      }
    } catch (e) {
      console.error(`Health ${label} FAIL:`, e.message);
    }
  }
  if (!healthOk) process.exitCode = 1;

  const loginBase = healthOk ? localBase : (publicBase || localBase);
  try {
    const loginRes = await fetch(`${loginBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@e-sante.sn', password: 'Admin123!' }),
    });
    const { json, text } = await parseJsonSafe(loginRes);
    if (loginRes.ok && json?.success) {
      console.log('Login HTTP', loginRes.status, 'OK — role:', json.data?.role);
    } else {
      console.log('Login HTTP', loginRes.status, json?.message || text);
      process.exitCode = 1;
    }
  } catch (e) {
    console.error('Login FAIL:', e.message);
    process.exitCode = 1;
  }

  try {
    const { sequelize } = require('../models');
    await sequelize.authenticate();
    console.log('MySQL OK');
  } catch (e) {
    console.error('MySQL FAIL:', e.message);
    process.exitCode = 1;
  }

  console.log('\n=== Fin diagnostic ===');
  if (process.exitCode) {
    console.log('\nActions recommandées :');
    console.log('  1. pm2 restart djamsante-api');
    console.log('  2. Dans .env : PM2_INSTANCES=1  DB_POOL_MAX=15');
    console.log('  3. curl -s http://127.0.0.1:3000/api/health');
    console.log('  4. Vérifier Nginx proxy /api → port 3000');
  }
})();
