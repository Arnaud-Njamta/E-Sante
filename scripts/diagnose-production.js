/**
 * Diagnostic production — à lancer sur le VPS : node scripts/diagnose-production.js
 */
require('dotenv').config({ override: true });

const base = process.env.API_PUBLIC_URL || `http://127.0.0.1:${process.env.PORT || 3000}/api`;

(async () => {
  console.log('=== Diagnostic DjamSanté ===\n');
  console.log('API:', base);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('PM2_INSTANCE:', process.env.NODE_APP_INSTANCE ?? 'non défini');
  console.log('DB_POOL_MAX:', process.env.DB_POOL_MAX || '15 (défaut)');
  console.log('PM2_INSTANCES:', process.env.PM2_INSTANCES || '1 (défaut fork)\n');

  try {
    const healthRes = await fetch(`${base}/health`);
    const health = await healthRes.json();
    console.log('Health HTTP', healthRes.status, JSON.stringify(health));
    if (!healthRes.ok) process.exitCode = 1;
  } catch (e) {
    console.error('Health FAIL — API injoignable:', e.message);
    process.exit(1);
  }

  try {
    const loginRes = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@e-sante.sn', password: 'Admin123!' }),
    });
    const loginBody = await loginRes.json();
    console.log('Login HTTP', loginRes.status, loginRes.ok ? 'OK' : loginBody.message || loginBody);
    if (!loginRes.ok) process.exitCode = 1;
  } catch (e) {
    console.error('Login FAIL:', e.message);
    process.exit(1);
  }

  try {
    const { sequelize } = require('../models');
    await sequelize.authenticate();
    const pool = sequelize.connectionManager.pool;
    console.log('MySQL OK — pool size:', pool?.size, 'available:', pool?.available);
  } catch (e) {
    console.error('MySQL FAIL:', e.message);
    process.exit(1);
  }

  console.log('\n=== Fin diagnostic ===');
})();
