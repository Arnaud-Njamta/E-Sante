#!/usr/bin/env node
/** Test manuel des rappels SMS RDV — usage : node scripts/test-rdv-reminder.js */
require('dotenv').config();
const { sendReminders } = require('../services/rdv-reminder.service');

sendReminders()
  .then((result) => {
    console.log('Résultat :', JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((err) => {
    console.error('Erreur :', err.message);
    process.exit(1);
  });
