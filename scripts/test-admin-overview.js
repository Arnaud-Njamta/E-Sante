/**
 * Test endpoint admin/overview (avec token admin).
 * Usage: node scripts/test-admin-overview.js <email> <password>
 */
require('dotenv').config({ override: true });

const email = process.argv[2] || 'admin@e-sante.sn';
const password = process.argv[3] || 'Admin123!';
const base = process.env.API_PUBLIC_URL || `http://127.0.0.1:${process.env.PORT || 3000}/api`;

(async () => {
  try {
    const loginRes = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const loginBody = await loginRes.json();
    if (!loginRes.ok) {
      console.log('Login FAIL', loginRes.status, loginBody);
      process.exit(1);
    }
    const token = loginBody.data?.token;
    console.log('Login OK, role:', loginBody.data?.role);

    const overviewRes = await fetch(`${base}/admin/overview`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const overviewText = await overviewRes.text();
    console.log('Overview HTTP', overviewRes.status);
    console.log(overviewText.slice(0, 400));

    const auditRes = await fetch(`${base}/admin/audit-logs?limit=5`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const auditText = await auditRes.text();
    console.log('Audit HTTP', auditRes.status);
    console.log(auditText.slice(0, 400));
    process.exit(overviewRes.ok && auditRes.ok ? 0 : 1);
  } catch (err) {
    console.error('ERR', err.message);
    process.exit(1);
  }
})();
