require('dotenv').config();
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });
const u = (process.env.AFRICAS_TALKING_USERNAME || '').trim();
const k = (process.env.AFRICAS_TALKING_API_KEY || '').trim();

console.log({
  username: u,
  keyLength: k.length,
  keyPrefix: k.slice(0, 10),
  keySuffix: k.slice(-6),
  hasWhitespace: /\s/.test(k),
});

const hit = (host) => new Promise((resolve) => {
  const req = https.request({
    hostname: host,
    path: `/version1/user?username=${encodeURIComponent(u)}`,
    method: 'GET',
    agent,
    headers: { apiKey: k, Accept: 'application/json' },
  }, (res) => {
    let d = '';
    res.on('data', (c) => { d += c; });
    res.on('end', () => {
      console.log(host, '->', res.statusCode, d.slice(0, 200));
      resolve(res.statusCode);
    });
  });
  req.on('error', (e) => {
    console.log(host, 'ERR', e.message);
    resolve(0);
  });
  req.end();
});

(async () => {
  await hit('api.sandbox.africastalking.com');
  await hit('api.africastalking.com');
})();
