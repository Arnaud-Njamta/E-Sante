/**
 * Crée ou réinitialise le compte administrateur (utile sur le VPS en production).
 * Usage : RESET_ADMIN_PASSWORD=true npm run ensure-admin
 */
require('dotenv').config();
const { sequelize } = require('../models');
const { seedAdminAccount } = require('../services/seed.service');

(async () => {
  try {
    process.env.RESET_ADMIN_PASSWORD = process.env.RESET_ADMIN_PASSWORD || 'true';
    await sequelize.authenticate();
    await seedAdminAccount();
    console.log('Terminé.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
