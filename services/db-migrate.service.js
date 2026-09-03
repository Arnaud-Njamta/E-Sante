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
  let lockHeld = false;
  try {
    const [lockRows] = await sequelize.query("SELECT GET_LOCK('djamsante_migrate', 120) AS l");
    lockHeld = lockRows[0]?.l === 1;
    if (!lockHeld) {
      console.warn('Migration: verrou non acquis, attente 3s…');
      await new Promise((r) => { setTimeout(r, 3000); });
    }

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
  await addColumnIfMissing('rendez_vous', 'ordonnance_scan_id', '`ordonnance_scan_id` CHAR(36) NULL AFTER `message_contre_proposition`');

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
  await addColumnIfMissing('etablissements', 'de_garde', '`de_garde` TINYINT(1) NOT NULL DEFAULT 0');
  await addColumnIfMissing('etablissements', 'garde_jusqu_a', '`garde_jusqu_a` DATETIME NULL');

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
    try {
      const [rows] = await sequelize.query(
        `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
        { replacements: [table, indexName] },
      );
      if (rows.length === 0) {
        await sequelize.query(`CREATE INDEX \`${indexName}\` ON \`${table}\` (${columnsSql})`);
        console.log(`Migration: index ${indexName} sur ${table}.`);
      }
    } catch (err) {
      const msg = String(err.message || err);
      if (!msg.includes('Duplicate') && !msg.includes('already exists')) {
        console.warn(`Migration index ${indexName} (${table}):`, msg);
      }
    }
  };

  await addIndexIfMissing('etablissements', 'idx_etab_actif_type', '`actif`, `type`, `statut_validation`');
  await addIndexIfMissing('etablissements', 'idx_etab_ville', '`ville`');
  await addIndexIfMissing('medecins', 'idx_med_actif_statut', '`actif`, `statut_validation`');
  await addIndexIfMissing('messages', 'idx_msg_conv_unread', '`conversation_id`, `expediteur_type`, `lu`');
  await addIndexIfMissing('admin_audit_logs', 'idx_audit_created', '`created_at`');
  await addIndexIfMissing('conversations', 'idx_conv_patient_statut', '`patient_id`, `statut`');
  await addIndexIfMissing('conversations', 'idx_conv_etab_statut', '`pharmacie_id`, `statut`');

  await addColumnIfMissing('patients', 'groupe_sanguin', '`groupe_sanguin` VARCHAR(5) NULL');
  await addColumnIfMissing('patients', 'antecedents_familiaux', '`antecedents_familiaux` JSON NULL');
  await addColumnIfMissing('patients', 'antecedents_chirurgicaux', '`antecedents_chirurgicaux` JSON NULL');
  await addColumnIfMissing('patients', 'traitements_habituelles', '`traitements_habituelles` JSON NULL');
  await addColumnIfMissing('patients', 'vaccinations', '`vaccinations` JSON NULL');
  await addColumnIfMissing('patients', 'notes_medicales', '`notes_medicales` TEXT NULL');
  await addColumnIfMissing('patients', 'consentement_carnet_at', '`consentement_carnet_at` DATETIME NULL');
  await addColumnIfMissing('patients', 'observations_carnet', '`observations_carnet` JSON NULL');
  await addColumnIfMissing('patients', 'region', '`region` VARCHAR(100) NULL');
  await addColumnIfMissing('patients', 'ville', '`ville` VARCHAR(100) NULL');
  await addColumnIfMissing('patients', 'langue', "`langue` VARCHAR(5) NOT NULL DEFAULT 'fr'");
  await addColumnIfMissing('patients', 'qr_token', '`qr_token` VARCHAR(64) NULL');

  const addUniqueIndexIfMissing = async (table, indexName, columnsSql) => {
    try {
      const [rows] = await sequelize.query(
        `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
        { replacements: [table, indexName] },
      );
      if (rows.length === 0) {
        await sequelize.query(`CREATE UNIQUE INDEX \`${indexName}\` ON \`${table}\` (${columnsSql})`);
        console.log(`Migration: index unique ${indexName} sur ${table}.`);
      }
    } catch (err) {
      console.warn(`Migration index unique ${indexName} (${table}) ignorée:`, err.message);
    }
  };
  await addUniqueIndexIfMissing('patients', 'idx_patients_qr_token', '`qr_token`');

  const [familleTables] = await sequelize.query(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'profils_famille'",
  );
  if (familleTables.length === 0) {
    await sequelize.query(`
      CREATE TABLE \`profils_famille\` (
        \`id\` CHAR(36) NOT NULL,
        \`patient_id\` CHAR(36) NOT NULL,
        \`nom\` VARCHAR(100) NOT NULL,
        \`prenom\` VARCHAR(100) NOT NULL,
        \`date_naissance\` DATE NULL,
        \`relation\` ENUM('enfant','parent','conjoint','autre') NOT NULL DEFAULT 'autre',
        \`groupe_sanguin\` VARCHAR(5) NULL,
        \`allergies\` JSON NULL,
        \`pathologies\` JSON NULL,
        \`traitements_habituelles\` JSON NULL,
        \`vaccinations\` JSON NULL,
        \`contact_urgence\` VARCHAR(255) NULL,
        \`notes_medicales\` TEXT NULL,
        \`observations_carnet\` JSON NULL,
        \`qr_token\` VARCHAR(64) NULL,
        \`actif\` TINYINT(1) NOT NULL DEFAULT 1,
        \`created_at\` DATETIME NOT NULL,
        \`updated_at\` DATETIME NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`qr_token\` (\`qr_token\`),
        INDEX \`pf_patient\` (\`patient_id\`, \`actif\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Migration: table profils_famille créée.');
  }

  await addColumnIfMissing('publications', 'region', '`region` VARCHAR(100) NULL');
  await addColumnIfMissing('publications', 'priorite', "`priorite` ENUM('info','attention','critique') NULL");
  await addColumnIfMissing('publications', 'expire_at', '`expire_at` DATETIME NULL');
  await addColumnIfMissing('publications', 'titre_en', '`titre_en` VARCHAR(300) NULL');
  await addColumnIfMissing('publications', 'contenu_en', '`contenu_en` TEXT NULL');

  try {
    await sequelize.query(
      "ALTER TABLE `publications` MODIFY COLUMN `type` "
      + "ENUM('actualite','realisation','alerte_sanitaire') NOT NULL DEFAULT 'actualite'",
    );
    console.log('Migration: publications.type inclut alerte_sanitaire.');
  } catch (err) {
    console.warn('Migration publications.type alerte_sanitaire:', err.message);
  }

  const [pushTables] = await sequelize.query(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'push_subscriptions'",
  );
  if (pushTables.length === 0) {
    await sequelize.query(`
      CREATE TABLE \`push_subscriptions\` (
        \`id\` CHAR(36) NOT NULL,
        \`user_role\` VARCHAR(20) NOT NULL,
        \`user_id\` CHAR(36) NOT NULL,
        \`endpoint\` TEXT NOT NULL,
        \`p256dh\` VARCHAR(255) NOT NULL,
        \`auth\` VARCHAR(255) NOT NULL,
        \`user_agent\` VARCHAR(500) NULL,
        \`created_at\` DATETIME NOT NULL,
        \`updated_at\` DATETIME NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`endpoint_unique\` (\`endpoint\`(255)),
        INDEX \`push_user\` (\`user_role\`, \`user_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Migration: table push_subscriptions créée.');
  }

  const [demandeTables] = await sequelize.query(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'demandes_prise_en_charge'",
  );
  if (demandeTables.length === 0) {
    await sequelize.query(`
      CREATE TABLE \`demandes_prise_en_charge\` (
        \`id\` CHAR(36) NOT NULL,
        \`numero_reference\` VARCHAR(50) NOT NULL,
        \`patient_id\` CHAR(36) NOT NULL,
        \`etablissement_id\` CHAR(36) NOT NULL,
        \`service_id\` CHAR(36) NULL,
        \`type_urgence\` VARCHAR(50) NULL,
        \`message_patient\` TEXT NULL,
        \`date_souhaitee\` DATE NULL,
        \`priorite\` ENUM('normal','urgent') NOT NULL DEFAULT 'normal',
        \`statut\` ENUM('en_attente','confirmee','refusee','annulee') NOT NULL DEFAULT 'en_attente',
        \`reponse_etablissement\` TEXT NULL,
        \`date_proposee\` DATE NULL,
        \`heure_proposee\` VARCHAR(5) NULL,
        \`created_at\` DATETIME NOT NULL,
        \`updated_at\` DATETIME NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`numero_reference\` (\`numero_reference\`),
        INDEX \`dpc_patient\` (\`patient_id\`),
        INDEX \`dpc_etab\` (\`etablissement_id\`, \`statut\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Migration: table demandes_prise_en_charge créée.');
  }

  await addColumnIfMissing('reservations_dispensaire', 'ordonnance_papier_id', '`ordonnance_papier_id` CHAR(36) NULL AFTER `ordonnance_electronique_id`');
  await addColumnIfMissing('ordonnances_electroniques', 'fichier_signature_id', '`fichier_signature_id` CHAR(36) NULL');

  await addColumnIfMissing(
    'inscriptions_professionnels',
    'pays',
    "`pays` VARCHAR(2) NOT NULL DEFAULT 'CM' AFTER `region`",
  );
  await addColumnIfMissing(
    'medecins',
    'pays',
    "`pays` VARCHAR(2) NOT NULL DEFAULT 'CM' AFTER `telephone`",
  );

  try {
    await sequelize.query(
      "ALTER TABLE `fichiers` MODIFY COLUMN `type_fichier` "
      + "ENUM('photo_profil','cachet','signature','document','produit','ordonnance_pdf',"
      + "'diplome','carte_ordre','agrement','autorisation',"
      + "'piece_identite','casier_judiciaire') NOT NULL",
    );
    console.log('Migration: fichiers.type_fichier inclut piece_identite et casier_judiciaire.');
  } catch (err) {
    console.warn('Migration fichiers.type_fichier:', err.message);
  }

  try {
    await sequelize.query(
      "ALTER TABLE `fichiers` MODIFY COLUMN `proprietaire_type` "
      + "ENUM('patient','medecin','etablissement','produit','inscription','ordonnance') NOT NULL",
    );
    console.log('Migration: fichiers.proprietaire_type inclut inscription.');
  } catch (err) {
    console.warn('Migration fichiers.proprietaire_type:', err.message);
  }

  const [consentTables] = await sequelize.query(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'consentements_patients'",
  );
  if (consentTables.length === 0) {
    await sequelize.query(`
      CREATE TABLE \`consentements_patients\` (
        \`id\` CHAR(36) NOT NULL,
        \`patient_id\` CHAR(36) NOT NULL,
        \`type\` VARCHAR(50) NOT NULL,
        \`medecin_id\` CHAR(36) NULL,
        \`rendez_vous_id\` CHAR(36) NULL,
        \`politique_version\` VARCHAR(20) NOT NULL DEFAULT '2026-01',
        \`accepte\` TINYINT(1) NOT NULL DEFAULT 1,
        \`ip\` VARCHAR(45) NULL,
        \`user_agent\` VARCHAR(255) NULL,
        \`revoked_at\` DATETIME NULL,
        \`created_at\` DATETIME NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`consent_patient_type\` (\`patient_id\`, \`type\`),
        INDEX \`consent_medecin\` (\`medecin_id\`, \`patient_id\`),
        INDEX \`consent_rdv\` (\`rendez_vous_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Migration: table consentements_patients créée.');
  }

  const [svcMedTables] = await sequelize.query(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'services_medecin'",
  );
  if (svcMedTables.length === 0) {
    await sequelize.query(`
      CREATE TABLE \`services_medecin\` (
        \`id\` CHAR(36) NOT NULL,
        \`medecin_id\` CHAR(36) NOT NULL,
        \`nom\` VARCHAR(255) NOT NULL,
        \`description\` TEXT NULL,
        \`categorie\` VARCHAR(100) NULL,
        \`prix_indicatif\` DECIMAL(10,2) NULL,
        \`duree_minutes\` INT NULL,
        \`disponible\` TINYINT(1) NOT NULL DEFAULT 1,
        \`created_at\` DATETIME NOT NULL,
        \`updated_at\` DATETIME NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`services_medecin_medecin\` (\`medecin_id\`),
        INDEX \`services_medecin_categorie\` (\`categorie\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Migration: table services_medecin créée.');
  }
  } finally {
    if (lockHeld) {
      await sequelize.query("SELECT RELEASE_LOCK('djamsante_migrate')");
    }
  }
};



module.exports = { runPendingMigrations };

