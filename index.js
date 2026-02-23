require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { sequelize } = require('./models');
const routes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARES GLOBAUX ====================

// Sécurité
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Trop de requêtes, réessayez dans 15 minutes' },
});
app.use('/api/', limiter);

// Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logs
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Fichiers statiques (uploads)
app.use('/uploads', express.static('uploads'));

// ==================== SWAGGER ====================

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'E-SANTE API Documentation',
}));

// ==================== ROUTES ====================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'E-SANTE API - Application d\'observance thérapeutique',
    version: '1.0.0',
    documentation: '/api-docs',
  });
});

app.use('/api', routes);

// ==================== GESTION DES ERREURS ====================

// Route 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} non trouvée`,
  });
});

// Middleware d'erreur global
app.use(errorMiddleware);

// ==================== DÉMARRAGE SERVEUR ====================

const start = async () => {
  try {
    // Connexion à la base de données
    await sequelize.authenticate();
    console.log('Connexion MySQL établie avec succès.');

    // Synchronisation des modèles (créer les tables si elles n'existent pas)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Tables synchronisées.');

    // Démarrage du serveur
    app.listen(PORT, () => {
      console.log(`\nServeur E-SANTE démarré sur le port ${PORT}`);
      console.log(`API:          http://localhost:${PORT}/api`);
      console.log(`Swagger:      http://localhost:${PORT}/api-docs`);
      console.log(`Environnement: ${process.env.NODE_ENV}\n`);
    });
  } catch (error) {
    console.error('Erreur au démarrage:', error.message);
    process.exit(1);
  }
};

start();
