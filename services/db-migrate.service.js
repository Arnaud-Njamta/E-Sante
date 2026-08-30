const { sequelize } = require('../models');



const columnExists = async (table, column) => {

  const [rows] = await sequelize.query(

    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS

     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,

    { replacements: [table, column] },

  );

  return rows.length > 0;

};



const addColumnIfMissing = async (table, column, definition) => {

  if (!(await columnExists(table, column))) {

    await sequelize.query(`ALTER TABLE \`${table}\` ADD COLUMN ${definition}`);

    console.log(`Migration: colonne ${table}.${column} ajoutée.`);

  }

};



const runPendingMigrations = async () => {

  await addColumnIfMissing('rendez_vous', 'lien_video', '`lien_video` VARCHAR(500) NULL AFTER `rappel_envoye`');



  await addColumnIfMissing('patients', 'consentement_recherche', '`consentement_recherche` TINYINT(1) NOT NULL DEFAULT 0');

  await addColumnIfMissing('patients', 'date_consentement', '`date_consentement` DATETIME NULL');

  await addColumnIfMissing('patients', 'politique_version', '`politique_version` VARCHAR(20) NULL');



  await addColumnIfMissing('medecins', 'reset_password_token', '`reset_password_token` VARCHAR(255) NULL');

  await addColumnIfMissing('medecins', 'reset_password_expires', '`reset_password_expires` DATETIME NULL');



  await addColumnIfMissing('etablissements', 'reset_password_token', '`reset_password_token` VARCHAR(255) NULL');

  await addColumnIfMissing('etablissements', 'reset_password_expires', '`reset_password_expires` DATETIME NULL');

  await addColumnIfMissing('admins', 'reset_password_token', '`reset_password_token` VARCHAR(255) NULL');
  await addColumnIfMissing('admins', 'reset_password_expires', '`reset_password_expires` DATETIME NULL');

  await addColumnIfMissing('rendez_vous', 'date_proposee', '`date_proposee` DATE NULL AFTER `lien_video`');
  await addColumnIfMissing('rendez_vous', 'heure_debut_proposee', '`heure_debut_proposee` VARCHAR(5) NULL AFTER `date_proposee`');
  await addColumnIfMissing('rendez_vous', 'heure_fin_proposee', '`heure_fin_proposee` VARCHAR(5) NULL AFTER `heure_debut_proposee`');
  await addColumnIfMissing('rendez_vous', 'message_contre_proposition', '`message_contre_proposition` TEXT NULL AFTER `heure_fin_proposee`');

  await addColumnIfMissing('medecins', 'coordonnees_paiement', '`coordonnees_paiement` JSON NULL');
  await addColumnIfMissing('etablissements', 'coordonnees_paiement', '`coordonnees_paiement` JSON NULL');

  await addColumnIfMissing('transactions', 'reference_paiement', '`reference_paiement` VARCHAR(100) NULL UNIQUE');
  await addColumnIfMissing('transactions', 'provider', "`provider` ENUM('cinetpay','simulation') NULL");
  await addColumnIfMissing('transactions', 'canal_paiement', '`canal_paiement` VARCHAR(50) NULL');
  await addColumnIfMissing('transactions', 'paye_le', '`paye_le` DATETIME NULL');
  await addColumnIfMissing('transactions', 'metadonnees_paiement', '`metadonnees_paiement` JSON NULL');

  await addColumnIfMissing('transactions', 'statut_reversement', "`statut_reversement` ENUM('non_applicable','en_attente','reverse','echec') NULL");
  await addColumnIfMissing('transactions', 'reverse_le', '`reverse_le` DATETIME NULL');
  await addColumnIfMissing('transactions', 'reference_reversement', '`reference_reversement` VARCHAR(100) NULL');
  await addColumnIfMissing('transactions', 'metadonnees_reversement', '`metadonnees_reversement` JSON NULL');

  await addColumnIfMissing('patients', 'telephone_verifie', '`telephone_verifie` TINYINT(1) NOT NULL DEFAULT 0');

  const [tables] = await sequelize.query(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'otp_codes'",
  );
  if (tables.length === 0) {
    await sequelize.query(`
      CREATE TABLE \`otp_codes\` (
        \`id\` CHAR(36) NOT NULL,
        \`telephone\` VARCHAR(20) NOT NULL,
        \`code_hash\` VARCHAR(255) NOT NULL,
        \`usage\` ENUM('register','reset_password','rdv_reminder') NOT NULL,
        \`expires_at\` DATETIME NOT NULL,
        \`verified_at\` DATETIME NULL,
        \`verification_token\` VARCHAR(64) NULL,
        \`verification_token_expires\` DATETIME NULL,
        \`attempts\` INT NOT NULL DEFAULT 0,
        \`consumed_at\` DATETIME NULL,
        \`createdAt\` DATETIME NOT NULL,
        \`updatedAt\` DATETIME NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`otp_codes_telephone_usage\` (\`telephone\`, \`usage\`),
        INDEX \`otp_codes_verification_token\` (\`verification_token\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Migration: table otp_codes créée.');
  }

  try {
    await sequelize.query(
      "ALTER TABLE `rendez_vous` MODIFY COLUMN `statut` ENUM('en_attente','confirme','contre_proposition','annule','termine','absent') NOT NULL DEFAULT 'en_attente'",
    );
  } catch (err) {
    if (!String(err.message).includes('Duplicate')) {
      console.warn('Migration statut rendez_vous:', err.message);
    }
  }

  const [auditTables] = await sequelize.query(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'admin_audit_logs'",
  );
  if (auditTables.length > 0) {
    if (await columnExists('admin_audit_logs', 'createdAt') && !(await columnExists('admin_audit_logs', 'created_at'))) {
      await sequelize.query(
        'ALTER TABLE `admin_audit_logs` CHANGE COLUMN `createdAt` `created_at` DATETIME NOT NULL',
      );
      console.log('Migration: admin_audit_logs.createdAt renommé en created_at.');
    }
  }
  if (auditTables.length === 0) {
    await sequelize.query(`
      CREATE TABLE \`admin_audit_logs\` (
        \`id\` CHAR(36) NOT NULL,
        \`categorie\` VARCHAR(40) NOT NULL,
        \`action\` VARCHAR(60) NOT NULL,
        \`acteur_id\` CHAR(36) NULL,
        \`acteur_label\` VARCHAR(120) NULL,
        \`cible_type\` VARCHAR(40) NULL,
        \`cible_id\` CHAR(36) NULL,
        \`details\` JSON NULL,
        \`ip\` VARCHAR(45) NULL,
        \`created_at\` DATETIME NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`admin_audit_logs_categorie\` (\`categorie\`),
        INDEX \`admin_audit_logs_action\` (\`action\`),
        INDEX \`admin_audit_logs_cible\` (\`cible_type\`, \`cible_id\`),
        INDEX \`admin_audit_logs_created\` (\`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Migration: table admin_audit_logs créée.');
  }
};



module.exports = { runPendingMigrations };

