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

  await addColumnIfMissing('medecins', 'disponible_maintenant', '`disponible_maintenant` TINYINT(1) NOT NULL DEFAULT 0');
  await addColumnIfMissing('medecins', 'joignable_urgence', '`joignable_urgence` TINYINT(1) NOT NULL DEFAULT 0');

  const [affTables] = await sequelize.query(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'medecin_affiliations'",
  );
  if (affTables.length === 0) {
    await sequelize.query(`
      CREATE TABLE \`medecin_affiliations\` (
        \`id\` CHAR(36) NOT NULL,
        \`medecin_id\` CHAR(36) NOT NULL,
        \`etablissement_id\` CHAR(36) NULL,
        \`type_lieu\` ENUM('hopital','clinique','cabinet_prive') NOT NULL DEFAULT 'clinique',
        \`role\` ENUM('titulaire','associe','remplacant','consultant','employe') NOT NULL DEFAULT 'employe',
        \`statut\` ENUM('en_attente','actif','refuse','termine') NOT NULL DEFAULT 'en_attente',
        \`nom_lieu\` VARCHAR(200) NULL,
        \`adresse\` VARCHAR(255) NULL,
        \`ville\` VARCHAR(100) NULL,
        \`horaires\` JSON NULL,
        \`date_debut\` DATE NULL,
        \`date_fin\` DATE NULL,
        \`message_invitation\` TEXT NULL,
        \`actuel\` TINYINT(1) NOT NULL DEFAULT 1,
        \`created_at\` DATETIME NOT NULL,
        \`updated_at\` DATETIME NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`medecin_affiliations_medecin\` (\`medecin_id\`),
        INDEX \`medecin_affiliations_etab\` (\`etablissement_id\`),
        INDEX \`medecin_affiliations_statut\` (\`statut\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Migration: table medecin_affiliations créée.');
  }

  const [parcoursTables] = await sequelize.query(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'parcours_professionnels'",
  );
  if (parcoursTables.length === 0) {
    await sequelize.query(`
      CREATE TABLE \`parcours_professionnels\` (
        \`id\` CHAR(36) NOT NULL,
        \`medecin_id\` CHAR(36) NOT NULL,
        \`type\` ENUM('experience','formation','certification') NOT NULL DEFAULT 'experience',
        \`titre\` VARCHAR(200) NOT NULL,
        \`organisme\` VARCHAR(200) NULL,
        \`lieu\` VARCHAR(150) NULL,
        \`date_debut\` DATE NULL,
        \`date_fin\` DATE NULL,
        \`description\` TEXT NULL,
        \`actuel\` TINYINT(1) NOT NULL DEFAULT 0,
        \`ordre\` INT NOT NULL DEFAULT 0,
        \`created_at\` DATETIME NOT NULL,
        \`updated_at\` DATETIME NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`parcours_professionnels_medecin\` (\`medecin_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Migration: table parcours_professionnels créée.');
  }

  const [membreTables] = await sequelize.query(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'membres_equipe_etablissement'",
  );
  if (membreTables.length === 0) {
    await sequelize.query(`
      CREATE TABLE \`membres_equipe_etablissement\` (
        \`id\` CHAR(36) NOT NULL,
        \`etablissement_id\` CHAR(36) NOT NULL,
        \`nom\` VARCHAR(100) NOT NULL,
        \`prenom\` VARCHAR(100) NOT NULL,
        \`role\` VARCHAR(100) NOT NULL DEFAULT 'Pharmacien',
        \`email\` VARCHAR(255) NULL,
        \`telephone\` VARCHAR(20) NULL,
        \`bio\` TEXT NULL,
        \`competences\` JSON NULL,
        \`actif\` TINYINT(1) NOT NULL DEFAULT 1,
        \`ordre\` INT NOT NULL DEFAULT 0,
        \`created_at\` DATETIME NOT NULL,
        \`updated_at\` DATETIME NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`membres_equipe_etab\` (\`etablissement_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Migration: table membres_equipe_etablissement créée.');
  }

  await addColumnIfMissing('fichiers', 'chemin_disque', '`chemin_disque` VARCHAR(512) NULL AFTER `taille`');

  const [dataCol] = await sequelize.query(
    `SELECT IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fichiers' AND COLUMN_NAME = 'data'`,
  );
  if (dataCol[0]?.IS_NULLABLE === 'NO') {
    await sequelize.query('ALTER TABLE `fichiers` MODIFY COLUMN `data` LONGBLOB NULL');
    console.log('Migration: fichiers.data nullable (stockage disque).');
  }

  await addColumnIfMissing(
    'medecins',
    'profession',
    "`profession` ENUM('medecin','infirmier','aide_soignant','sage_femme','kinesitherapeute') NOT NULL DEFAULT 'medecin' AFTER `specialite`",
  );

  await addColumnIfMissing('etablissements', 'latitude', '`latitude` DECIMAL(10, 8) NULL');
  await addColumnIfMissing('etablissements', 'longitude', '`longitude` DECIMAL(11, 8) NULL');

  try {
    await sequelize.query(
      "ALTER TABLE `inscriptions_professionnels` MODIFY COLUMN `type_profil` VARCHAR(40) NOT NULL",
    );
  } catch (err) {
    console.warn('Migration type_profil inscription:', err.message);
  }

  const [priseRappelTables] = await sequelize.query(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'prise_rappels_envoyes'",
  );
  if (priseRappelTables.length === 0) {
    await sequelize.query(`
      CREATE TABLE \`prise_rappels_envoyes\` (
        \`id\` CHAR(36) NOT NULL,
        \`prise_programmee_id\` CHAR(36) NOT NULL,
        \`patient_id\` CHAR(36) NOT NULL,
        \`date_rappel\` DATE NOT NULL,
        \`heure_prise\` VARCHAR(5) NOT NULL,
        \`canal\` VARCHAR(20) NULL,
        \`created_at\` DATETIME NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`prise_rappel_unique\` (\`prise_programmee_id\`, \`patient_id\`, \`date_rappel\`, \`heure_prise\`),
        INDEX \`prise_rappel_patient\` (\`patient_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Migration: table prise_rappels_envoyes créée.');
  }

  const addIndexIfMissing = async (table, indexName, columnsSql) => {
    const [rows] = await sequelize.query(
      `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
      { replacements: [table, indexName] },
    );
    if (rows.length === 0) {
      await sequelize.query(`CREATE INDEX \`${indexName}\` ON \`${table}\` (${columnsSql})`);
      console.log(`Migration: index ${indexName} sur ${table}.`);
    }
  };

  await addIndexIfMissing('etablissements', 'idx_etab_actif_type', '`actif`, `type`, `statut_validation`');
  await addIndexIfMissing('etablissements', 'idx_etab_ville', '`ville`');
  await addIndexIfMissing('medecins', 'idx_med_actif_statut', '`actif`, `statut_validation`');
  await addIndexIfMissing('messages', 'idx_msg_conv_unread', '`conversation_id`, `expediteur_type`, `lu`');
  await addIndexIfMissing('admin_audit_logs', 'idx_audit_created', '`created_at`');
  await addIndexIfMissing('conversations', 'idx_conv_patient_statut', '`patient_id`, `statut`');
  await addIndexIfMissing('conversations', 'idx_conv_etab_statut', '`pharmacie_id`, `statut`');
};



module.exports = { runPendingMigrations };

