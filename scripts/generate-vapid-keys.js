#!/usr/bin/env node
/** Génère des clés VAPID pour les notifications push Web */
const webpush = require('web-push');
const keys = webpush.generateVAPIDKeys();
console.log('Ajoutez ces lignes à votre .env :\n');
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log('VAPID_SUBJECT=mailto:admin@e-sante.sn');
