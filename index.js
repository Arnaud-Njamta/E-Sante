require('dotenv').config();



const express = require('express');

const cors = require('cors');

const helmet = require('helmet');

const morgan = require('morgan');

const path = require('path');

const fs = require('fs');

const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./config/swagger');

const { buildCorsOptions, globalApiLimiter } = require('./config/security');

const { sequelize } = require('./models');

const routes = require('./routes');

const errorMiddleware = require('./middlewares/error.middleware');

const { seedDemoData, seedDemoAccounts, seedPublications, seedDispensaireDemo, seedAdminAccount } = require('./services/seed.service');



const app = express();

const PORT = process.env.PORT || 3000;

const IS_PROD = process.env.NODE_ENV === 'production';



// ==================== MIDDLEWARES GLOBAUX ====================



app.use(helmet({

  crossOriginResourcePolicy: { policy: 'cross-origin' },

}));

app.use(cors(buildCorsOptions()));

app.use(globalApiLimiter);



app.use(express.json({ limit: '2mb' }));

app.use(express.urlencoded({ extended: true }));



if (!IS_PROD) {

  app.use(morgan('dev'));

} else {

  app.use(morgan('combined'));

}



// Uploads : accès direct uniquement en développement (production → routes authentifiées)

if (!IS_PROD) {

  app.use('/uploads', express.static('uploads'));

}



// ==================== SWAGGER ====================



if (!IS_PROD || process.env.ENABLE_SWAGGER === 'true') {

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {

    customCss: '.swagger-ui .topbar { display: none }',

    customSiteTitle: 'DjamSanté API Documentation',

  }));

}



// ==================== ROUTES ====================



app.get('/', (req, res) => {

  res.json({

    success: true,

    message: 'DjamSanté API - Application d\'observance thérapeutique',

    version: '1.0.0',

    documentation: IS_PROD ? undefined : '/api-docs',

  });

});



app.get('/api/health', (req, res) => {

  res.json({ success: true, status: 'ok', env: process.env.NODE_ENV });

});



app.use('/api', routes);



app.use((req, res) => {

  res.status(404).json({

    success: false,

    message: `Route ${req.originalUrl} non trouvée`,

  });

});



app.use(errorMiddleware);



// ==================== DÉMARRAGE SERVEUR ====================



const runSeeds = async () => {
  await seedAdminAccount();

  if (IS_PROD && process.env.SEED_DEMO !== 'true') {
    console.log('Mode production : seeds démo désactivés.');
    return;
  }

  await seedDemoData();
  await seedDemoAccounts();
  await seedPublications();
  await seedDispensaireDemo();
};



const validateJwtSecret = () => {

  const secret = process.env.JWT_SECRET || '';

  if (IS_PROD && (secret.length < 32 || secret.includes('your_secret') || secret.includes('change_me'))) {

    console.error('❌ JWT_SECRET trop faible pour la production. Utilisez une clé aléatoire d\'au moins 32 caractères.');

    process.exit(1);

  }

};



const start = async () => {

  try {

    validateJwtSecret();

    await sequelize.authenticate();

    console.log('Connexion MySQL établie avec succès.');



    const syncOptions = process.env.DB_SYNC_ALTER === 'true' ? { alter: true } : {};

    await sequelize.sync(syncOptions);

    console.log('Tables synchronisées.');



    const { runPendingMigrations } = require('./services/db-migrate.service');

    await runPendingMigrations();



    await runSeeds();



    const server = app.listen(PORT, () => {

      console.log(`\nServeur DjamSanté démarré sur le port ${PORT}`);

      console.log(`API:          http://localhost:${PORT}/api`);

      if (!IS_PROD) console.log(`Swagger:      http://localhost:${PORT}/api-docs`);

      console.log(`Environnement: ${process.env.NODE_ENV}\n`);

      const { startRdvReminderScheduler } = require('./services/rdv-reminder.scheduler');
      startRdvReminderScheduler();

    });



    server.on('error', (err) => {

      if (err.code === 'EADDRINUSE') {

        console.error(`\n❌ Le port ${PORT} est déjà utilisé.`);

        process.exit(1);

      }

      console.error('Erreur serveur:', err.message);

      process.exit(1);

    });

  } catch (error) {

    console.error('Erreur au démarrage:', error.message);

    process.exit(1);

  }

};



start();

