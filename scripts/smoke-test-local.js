/**
 * Smoke test local — phases 1-4 (sans push)
 * Usage: node scripts/smoke-test-local.js
 * Prérequis: API démarrée (npm run dev) sur PORT du .env
 */
require('dotenv').config();
const http = require('http');

const BASE = `http://127.0.0.1:${process.env.PORT || 5000}`;
const tests = [];

function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const opts = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: { 'Content-Type': 'application/json' },
    };
    if (token) opts.headers.Authorization = `Bearer ${token}`;
    const r = http.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        let json;
        try { json = JSON.parse(data); } catch { json = data; }
        resolve({ status: res.statusCode, body: json });
      });
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

async function run() {
  console.log(`\n🔍 Smoke test — ${BASE}\n`);

  // Health
  const health = await req('GET', '/api/health');
  tests.push({ name: 'GET /api/health', ok: health.status === 200 });

  // Login patient
  const login = await req('POST', '/api/auth/login', {
    email: 'patient@e-sante.sn',
    password: 'Patient123!',
  });
  const token = login.body?.data?.token || login.body?.token;
  tests.push({ name: 'POST /api/auth/login (patient)', ok: !!token });

  if (token) {
    const profile = await req('PUT', '/api/patients/profile', {
      region: 'Littoral',
      ville: 'Douala',
      langue: 'fr',
    }, token);
    tests.push({ name: 'PUT /api/patients/profile (region/ville)', ok: profile.status === 200 });

    const qr = await req('GET', '/api/qr-medical/me/qr', null, token);
    tests.push({ name: 'GET /api/qr-medical/me/qr', ok: qr.status === 200 });

    const famille = await req('GET', '/api/famille', null, token);
    tests.push({ name: 'GET /api/famille', ok: famille.status === 200 });

    const urg = await req('GET', '/api/urgence/types', null, token);
    tests.push({ name: 'GET /api/urgence/types', ok: urg.status === 200 });
  }

  // Login admin
  const adminLogin = await req('POST', '/api/auth/login', {
    email: 'admin@e-sante.sn',
    password: 'Admin123!',
  });
  const adminToken = adminLogin.body?.data?.token || adminLogin.body?.token;
  tests.push({ name: 'POST /api/auth/login (admin)', ok: !!adminToken });

  if (adminToken) {
    const sp = await req('GET', '/api/admin/sante-publique', null, adminToken);
    tests.push({ name: 'GET /api/admin/sante-publique', ok: sp.status === 200 });

    const regions = await req('GET', '/api/admin/regions', null, adminToken);
    tests.push({ name: 'GET /api/admin/regions', ok: regions.status === 200 });

    const alertes = await req('GET', '/api/admin/alertes-sanitaires', null, adminToken);
    tests.push({ name: 'GET /api/admin/alertes-sanitaires', ok: alertes.status === 200 });
  }

  const pushKey = await req('GET', '/api/notifications/push/vapid-public-key');
  tests.push({ name: 'GET /api/notifications/push/vapid-public-key', ok: pushKey.status === 200 });

  let failed = 0;
  for (const t of tests) {
    const icon = t.ok ? '✅' : '❌';
    console.log(`${icon} ${t.name}`);
    if (!t.ok) failed++;
  }

  console.log(`\n${tests.length - failed}/${tests.length} OK\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('Erreur:', err.message);
  console.error('→ Démarrez l\'API: cd E-Sante && npm run dev');
  process.exit(1);
});
