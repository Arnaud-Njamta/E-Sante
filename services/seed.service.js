const { Etablissement, ServiceEtablissement, Medecin, ProduitPharmacie } = require('../models');

const seedDemoData = async () => {
  const count = await Etablissement.count();
  if (count > 0) return;

  console.log('Insertion des données de démonstration (annuaire santé)...');

  const pharmacie = await Etablissement.create({
    type: 'pharmacie',
    nom: 'Pharmacie Centrale',
    description: 'Pharmacie de garde avec service de conseil pharmaceutique et vérification de disponibilité en temps réel.',
    adresse: '12 Avenue Kennedy',
    ville: 'Yaoundé',
    region: 'Centre',
    telephone: '+237 222 22 33 44',
    email: 'contact@pharmacie-centrale.sn',
    chat_actif: true,
    horaires_ouverture: {
      lundi: { ouvert: true, debut: '08:00', fin: '22:00' },
      mardi: { ouvert: true, debut: '08:00', fin: '22:00' },
      mercredi: { ouvert: true, debut: '08:00', fin: '22:00' },
      jeudi: { ouvert: true, debut: '08:00', fin: '22:00' },
      vendredi: { ouvert: true, debut: '08:00', fin: '22:00' },
      samedi: { ouvert: true, debut: '09:00', fin: '20:00' },
      dimanche: { ouvert: true, debut: '10:00', fin: '14:00' },
      h24: false,
    },
  });

  await Etablissement.create({
    type: 'pharmacie',
    nom: 'Pharmacie du Plateau',
    description: 'Pharmacie ouverte 24h/24 pour vos urgences médicales.',
    adresse: '45 Boulevard de la Liberté',
    ville: 'Douala',
    region: 'Littoral',
    telephone: '+237 233 43 21 00',
    chat_actif: true,
    horaires_ouverture: {
      lundi: { ouvert: true, debut: '00:00', fin: '23:59' },
      mardi: { ouvert: true, debut: '00:00', fin: '23:59' },
      mercredi: { ouvert: true, debut: '00:00', fin: '23:59' },
      jeudi: { ouvert: true, debut: '00:00', fin: '23:59' },
      vendredi: { ouvert: true, debut: '00:00', fin: '23:59' },
      samedi: { ouvert: true, debut: '00:00', fin: '23:59' },
      dimanche: { ouvert: true, debut: '00:00', fin: '23:59' },
      h24: true,
    },
  });

  const hopital = await Etablissement.create({
    type: 'hopital',
    nom: 'Hôpital Central de Yaoundé',
    description: 'Centre hospitalier de référence — urgences 24h/24, aligné MINSANTE et CSU.',
    adresse: 'Avenue Henri Dunant, Quartier Hippodrome',
    ville: 'Yaoundé',
    region: 'Centre',
    telephone: '+237 222 23 40 02',
    email: 'contact@hcy.cm',
    chat_actif: true,
    numero_agrement: 'MINSANTE-HCY-2019',
  });

  const clinique = await Etablissement.create({
    type: 'clinique',
    nom: 'Clinique Laquintinie',
    description: 'Clinique privée à Douala — cardiologie, imagerie médicale et téléconsultation.',
    adresse: 'Boulevard de la République, Akwa',
    ville: 'Douala',
    region: 'Littoral',
    telephone: '+237 233 42 26 26',
    email: 'info@clinique-laquintinie.cm',
    numero_agrement: 'MINSANTE-CLQ-2021',
    chat_actif: true,
  });

  await ServiceEtablissement.bulkCreate([
    { etablissement_id: hopital.id, nom: 'Urgences', categorie: 'Urgence', description: 'Prise en charge des urgences médicales', duree_minutes: null, disponible: true },
    { etablissement_id: hopital.id, nom: 'Consultation générale', categorie: 'Consultation', description: 'Consultation avec médecin généraliste', prix_indicatif: 5000, duree_minutes: 30, disponible: true },
    { etablissement_id: hopital.id, nom: 'Radiologie', categorie: 'Imagerie', description: 'Scanner, IRM, radiographie', prix_indicatif: 35000, duree_minutes: 45, disponible: true },
    { etablissement_id: hopital.id, nom: 'Laboratoire d\'analyses', categorie: 'Analyses', description: 'Prises de sang et analyses biologiques', prix_indicatif: 7500, duree_minutes: 15, disponible: true },
    { etablissement_id: clinique.id, nom: 'Consultation cardiologie', categorie: 'Spécialité', description: 'Suivi cardiaque et ECG', prix_indicatif: 15000, duree_minutes: 45, disponible: true },
    { etablissement_id: clinique.id, nom: 'Échographie', categorie: 'Imagerie', description: 'Échographie abdominale et pelvienne', prix_indicatif: 20000, duree_minutes: 30, disponible: true },
    { etablissement_id: clinique.id, nom: 'Vaccination', categorie: 'Prévention', description: 'Vaccins et rappels (PEV)', prix_indicatif: 5000, duree_minutes: 15, disponible: true },
    { etablissement_id: pharmacie.id, nom: 'Délivrance d\'ordonnance', categorie: 'Médicament', description: 'Préparation et délivrance sur ordonnance', disponible: true },
    { etablissement_id: pharmacie.id, nom: 'Conseil pharmaceutique', categorie: 'Conseil', description: 'Conseil sur les médicaments sans ordonnance', disponible: true },
  ]);

  await ProduitPharmacie.bulkCreate([
    { pharmacie_id: clinique.id, nom: 'Paracétamol 500 mg', description: 'Antalgique — boîte de 20', categorie: 'antalgique', prix_fcfa: 1500, stock_disponible: 80, necessite_ordonnance: false },
    { pharmacie_id: clinique.id, nom: 'Amoxicilline 500 mg', description: 'Antibiotique — boîte de 12', categorie: 'antibiotique', prix_fcfa: 3500, stock_disponible: 45, necessite_ordonnance: true },
    { pharmacie_id: clinique.id, nom: 'Artéméther-Luméfantrine', description: 'Antipaludéen — traitement 6 doses', categorie: 'antipaludéen', prix_fcfa: 4200, stock_disponible: 30, necessite_ordonnance: true },
    { pharmacie_id: hopital.id, nom: 'Sérum physiologique 500 ml', description: 'Perfusion', categorie: 'matériel médical', prix_fcfa: 1200, stock_disponible: 100, necessite_ordonnance: false },
    { pharmacie_id: hopital.id, nom: 'Metformine 850 mg', description: 'Antidiabétique — boîte de 30', categorie: 'antidiabétique', prix_fcfa: 2800, stock_disponible: 25, necessite_ordonnance: true },
    { pharmacie_id: pharmacie.id, nom: 'Doliprane 1000 mg', description: 'Paracétamol — boîte de 8', categorie: 'antalgique', prix_fcfa: 2000, stock_disponible: 120, necessite_ordonnance: false },
    { pharmacie_id: pharmacie.id, nom: 'Amoxicilline 1 g', description: 'Antibiotique — boîte de 12', categorie: 'antibiotique', prix_fcfa: 4500, stock_disponible: 60, necessite_ordonnance: true },
    { pharmacie_id: pharmacie.id, nom: 'Artéméther-Luméfantrine (Coartem)', description: 'Antipaludéen — 24 comprimés', categorie: 'antipaludéen', prix_fcfa: 5500, stock_disponible: 40, necessite_ordonnance: true },
    { pharmacie_id: pharmacie.id, nom: 'Ibuprofène 400 mg', description: 'Anti-inflammatoire — boîte de 20', categorie: 'antalgique', prix_fcfa: 1800, stock_disponible: 90, necessite_ordonnance: false },
    { pharmacie_id: pharmacie.id, nom: 'Oméprazole 20 mg', description: 'Gastro — boîte de 14', categorie: 'gastro', prix_fcfa: 3200, stock_disponible: 55, necessite_ordonnance: true },
    { pharmacie_id: pharmacie.id, nom: 'Amlodipine 5 mg', description: 'Antihypertenseur — boîte de 30', categorie: 'cardiologie', prix_fcfa: 2900, stock_disponible: 35, necessite_ordonnance: true },
    { pharmacie_id: pharmacie.id, nom: 'Vitamine C 500 mg', description: 'Complément — boîte de 30', categorie: 'vitamines', prix_fcfa: 1500, stock_disponible: 100, necessite_ordonnance: false },
    { pharmacie_id: pharmacie.id, nom: 'Sérum physiologique 250 ml', description: 'Nasal / lavage', categorie: 'matériel médical', prix_fcfa: 900, stock_disponible: 75, necessite_ordonnance: false },
    { pharmacie_id: pharmacie.id, nom: 'Azithromycine 500 mg', description: 'Antibiotique — boîte de 3', categorie: 'antibiotique', prix_fcfa: 3800, stock_disponible: 28, necessite_ordonnance: true },
    { pharmacie_id: pharmacie.id, nom: 'Cotrimoxazole 480 mg', description: 'Antibiotique — boîte de 20', categorie: 'antibiotique', prix_fcfa: 2200, stock_disponible: 42, necessite_ordonnance: true },
  ]);

  await Medecin.bulkCreate([
    {
      etablissement_id: hopital.id,
      nom: 'Diop',
      prenom: 'Amadou',
      specialite: 'Médecine générale',
      numero_ordre: 'MG-2015-0042',
      bio: 'Médecin généraliste avec 15 ans d\'expérience en milieu hospitalier. Spécialisé dans le suivi des maladies chroniques.',
      competences: ['Médecine générale', 'Diabétologie', 'Hypertension', 'Médecine préventive'],
      langues: ['Français', 'Wolof', 'Anglais'],
      annees_experience: 15,
      telephone: '+221 77 123 45 67',
    },
    {
      etablissement_id: clinique.id,
      nom: 'Ndiaye',
      prenom: 'Fatou',
      specialite: 'Cardiologie',
      numero_ordre: 'CAR-2012-0018',
      bio: 'Cardiologue diplômée de la faculté de médecine de Dakar. Expertise en échocardiographie et suivi post-infarctus.',
      competences: ['Cardiologie', 'Échocardiographie', 'ECG', 'Hypertension artérielle', 'Insuffisance cardiaque'],
      langues: ['Français', 'Wolof'],
      annees_experience: 12,
      telephone: '+221 77 234 56 78',
    },
    {
      etablissement_id: clinique.id,
      nom: 'Sow',
      prenom: 'Moussa',
      specialite: 'Pédiatrie',
      numero_ordre: 'PED-2018-0033',
      bio: 'Pédiatre passionné par la santé infantile et la vaccination. Consultations pour enfants de 0 à 16 ans.',
      competences: ['Pédiatrie', 'Vaccination', 'Nutrition infantile', 'Développement de l\'enfant'],
      langues: ['Français', 'Wolof', 'Peul'],
      annees_experience: 8,
      telephone: '+221 77 345 67 89',
    },
    {
      etablissement_id: hopital.id,
      nom: 'Ba',
      prenom: 'Aïssatou',
      specialite: 'Gynécologie-obstétrique',
      numero_ordre: 'GYN-2010-0007',
      bio: 'Gynécologue-obstétricienne, suivi de grossesse et consultations gynécologiques.',
      competences: ['Gynécologie', 'Obstétrique', 'Suivi de grossesse', 'Échographie obstétricale'],
      langues: ['Français', 'Wolof'],
      annees_experience: 16,
      telephone: '+221 77 456 78 90',
    },
  ]);

  console.log('Données de démonstration insérées avec succès.');
};

const seedDemoAccounts = async () => {
  const bcrypt = require('bcrypt');
  const { Patient } = require('../models');

  const medecinHash = await bcrypt.hash('Medecin123!', 12);
  const pharmaHash = await bcrypt.hash('Pharmacie123!', 12);
  const patientHash = await bcrypt.hash('Patient123!', 12);

  const medecin = await Medecin.findOne({ where: { nom: 'Ndiaye', prenom: 'Fatou' } });
  if (medecin && !medecin.password_hash) {
    await medecin.update({ email: 'dr.fatou@e-sante.sn', password_hash: medecinHash });
    console.log('Compte médecin démo: dr.fatou@e-sante.sn / Medecin123!');
  }

  const pharmacie = await Etablissement.findOne({ where: { nom: 'Pharmacie Centrale' } });
  if (pharmacie && !pharmacie.password_hash) {
    await pharmacie.update({ email: 'pharma@e-sante.sn', password_hash: pharmaHash });
    console.log('Compte pharmacie démo: pharma@e-sante.sn / Pharmacie123!');
  }

  const patient = await Patient.findOne({ where: { email: 'patient@e-sante.sn' } });
  if (!patient) {
    await Patient.create({
      email: 'patient@e-sante.sn',
      password_hash: patientHash,
      nom: 'Demo',
      prenom: 'Patient',
      telephone: '0612345678',
    });
    console.log('Compte patient démo: patient@e-sante.sn / Patient123!');
  }

  const hopital = await Etablissement.findOne({ where: { nom: 'Hôpital Central de Yaoundé' } });
  if (!hopital) {
    const legacy = await Etablissement.findOne({ where: { nom: 'Hôpital Principal de Dakar' } });
    if (legacy && !legacy.password_hash) {
      await legacy.update({ email: 'hopital@e-sante.sn', password_hash: pharmaHash });
    }
  } else if (!hopital.password_hash) {
    await hopital.update({ email: 'hopital@e-sante.sn', password_hash: pharmaHash });
    console.log('Compte hôpital démo: hopital@e-sante.sn / Pharmacie123!');
  }

  const clinique = await Etablissement.findOne({ where: { nom: 'Clinique Laquintinie' } });
  if (!clinique) {
    const legacy = await Etablissement.findOne({ where: { nom: 'Clinique Médicale Almadies' } });
    if (legacy && !legacy.password_hash) {
      await legacy.update({ email: 'clinique@e-sante.sn', password_hash: pharmaHash });
    }
  } else if (!clinique.password_hash) {
    await clinique.update({ email: 'clinique@e-sante.sn', password_hash: pharmaHash });
    console.log('Compte clinique démo: clinique@e-sante.sn / Pharmacie123!');
  }
};

const seedPublications = async () => {
  const { Op } = require('sequelize');
  const { Publication } = require('../models');
  const count = await Publication.count();
  if (count > 0) return;

  const medecin = await Medecin.findOne({ where: { nom: 'Ndiaye', prenom: 'Fatou' } });
  const pharmacie = await Etablissement.findOne({ where: { nom: 'Pharmacie Centrale' } });
  const hopital = await Etablissement.findOne({
    where: { nom: { [Op.in]: ['Hôpital Central de Yaoundé', 'Hôpital Principal de Dakar'] } },
  });
  const clinique = await Etablissement.findOne({
    where: { nom: { [Op.in]: ['Clinique Laquintinie', 'Clinique Médicale Almadies'] } },
  });

  if (!medecin) return;

  await Publication.bulkCreate([
    {
      auteur_type: 'medecin',
      auteur_id: medecin.id,
      auteur_nom: 'Dr. Fatou Ndiaye',
      type: 'realisation',
      titre: '1000 consultations cardiaques réalisées au Cameroun',
      contenu: 'Grâce à la télémédecine DjamSanté, nous avons pu suivre plus de 1000 patients atteints de maladies cardiovasculaires à Yaoundé et Douala.',
      mis_en_avant: true,
      likes_count: 47,
      comments_count: 8,
    },
    {
      auteur_type: 'pharmacie',
      auteur_id: pharmacie?.id,
      auteur_nom: 'Pharmacie Centrale',
      type: 'actualite',
      titre: 'Campagne de dépistage du diabète — gratuit cette semaine',
      contenu: 'Test glycémie gratuit du lundi au vendredi de 9h à 17h. Pensez à apporter votre carnet de santé.',
      mis_en_avant: true,
      likes_count: 32,
      comments_count: 5,
    },
    {
      auteur_type: 'hopital',
      auteur_id: hopital?.id,
      auteur_nom: hopital?.nom || 'Hôpital Central de Yaoundé',
      type: 'realisation',
      titre: 'Nouveau bloc opératoire inauguré à Yaoundé',
      contenu: 'Un bloc moderne de 4 salles opératoires, financé dans le cadre du Plan Santé Numérique MINSANTE, est désormais opérationnel.',
      mis_en_avant: true,
      likes_count: 89,
      comments_count: 12,
    },
    {
      auteur_type: 'clinique',
      auteur_id: clinique?.id,
      auteur_nom: clinique?.nom || 'Clinique Laquintinie',
      type: 'actualite',
      titre: 'Journée portes ouvertes — vaccination enfants',
      contenu: 'Samedi prochain : consultation pédiatrique et rappels vaccinaux à tarif réduit.',
      mis_en_avant: true,
      likes_count: 24,
      comments_count: 3,
    },
    {
      auteur_type: 'medecin',
      auteur_id: medecin.id,
      auteur_nom: 'Dr. Fatou Ndiaye',
      type: 'actualite',
      titre: 'Conseils pour la saison des pluies',
      contenu: 'Attention aux fièvres et infections respiratoires. Consultez sans attendre en cas de fièvre persistante.',
      mis_en_avant: false,
      likes_count: 15,
      comments_count: 2,
    },
  ]);
  console.log('Publications de démonstration insérées.');
};

const seedDispensaireDemo = async () => {
  const clinique = await Etablissement.findOne({
    where: { type: 'clinique' },
    order: [['createdAt', 'ASC']],
  });
  if (!clinique) return;

  const count = await ProduitPharmacie.count({ where: { pharmacie_id: clinique.id } });
  if (count > 0) return;

  const hopital = await Etablissement.findOne({ where: { type: 'hopital' } });

  const rows = [
    { pharmacie_id: clinique.id, nom: 'Paracétamol 500 mg', description: 'Antalgique', categorie: 'antalgique', prix_fcfa: 1500, stock_disponible: 80, necessite_ordonnance: false },
    { pharmacie_id: clinique.id, nom: 'Amoxicilline 500 mg', description: 'Antibiotique', categorie: 'antibiotique', prix_fcfa: 3500, stock_disponible: 45, necessite_ordonnance: true },
  ];
  if (hopital) {
    rows.push({ pharmacie_id: hopital.id, nom: 'Metformine 850 mg', description: 'Antidiabétique', categorie: 'antidiabétique', prix_fcfa: 2800, stock_disponible: 25, necessite_ordonnance: true });
  }
  await ProduitPharmacie.bulkCreate(rows);
  console.log('Produits dispensaire démo insérés.');

  await Etablissement.update(
    { chat_actif: true },
    { where: { type: { [require('sequelize').Op.in]: ['hopital', 'clinique'] } } },
  );
};

const seedAdminAccount = async () => {
  const bcrypt = require('bcrypt');
  const { Admin } = require('../models');
  const email = (process.env.ADMIN_EMAIL || 'admin@e-sante.sn').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';
  const hash = await bcrypt.hash(password, 12);
  const [admin, created] = await Admin.findOrCreate({
    where: { email },
    defaults: { nom: 'Administrateur MINSANTE', password_hash: hash, actif: true },
  });
  if (!created) {
    const mustReset = !admin.password_hash
      || process.env.RESET_ADMIN_PASSWORD === 'true'
      || (process.env.NODE_ENV !== 'production' && process.env.RESET_ADMIN_PASSWORD !== 'false');
    if (mustReset) {
      await admin.update({ password_hash: hash, actif: true });
      console.log(`Compte admin assuré : ${email}`);
    }
  } else {
    console.log(`Compte admin créé : ${email}`);
  }
  const medecin = await Medecin.findOne({ where: { nom: 'Ndiaye', prenom: 'Fatou' } });
  if (medecin && !medecin.accepte_teleconsultation) {
    await medecin.update({ accepte_teleconsultation: true, tarif_consultation_fcfa: 15000 });
  }

  const { DEFAULT_HORAIRES_MEDECIN } = require('./rendezvous.service');
  const medecins = await Medecin.findAll();
  await Promise.all(medecins.map(async (m) => {
    let parsed = {};
    try {
      parsed = typeof m.horaires_consultation === 'string'
        ? JSON.parse(m.horaires_consultation || '{}')
        : (m.horaires_consultation || {});
    } catch {
      parsed = {};
    }
    const hasActive = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
      .some((jour) => parsed[jour]?.actif && parsed[jour]?.creneaux?.length);
    if (!hasActive) {
      await m.update({ horaires_consultation: DEFAULT_HORAIRES_MEDECIN });
    }
  }));
  if (created) {
    console.log('Identifiants admin démo : admin@e-sante.sn / Admin123!');
  }
};

const seedPharmacieProducts = async () => {
  const pharmacies = await Etablissement.findAll({ where: { type: 'pharmacie' } });
  const catalogue = [
    { nom: 'Paracétamol 500 mg', description: 'Antalgique — boîte de 20', categorie: 'antalgique', prix_fcfa: 1500, stock_disponible: 100, necessite_ordonnance: false },
    { nom: 'Doliprane 1000 mg', description: 'Paracétamol — boîte de 8', categorie: 'antalgique', prix_fcfa: 2000, stock_disponible: 80, necessite_ordonnance: false },
    { nom: 'Ibuprofène 400 mg', description: 'Anti-inflammatoire', categorie: 'antalgique', prix_fcfa: 1800, stock_disponible: 70, necessite_ordonnance: false },
    { nom: 'Amoxicilline 500 mg', description: 'Antibiotique', categorie: 'antibiotique', prix_fcfa: 3500, stock_disponible: 50, necessite_ordonnance: true },
    { nom: 'Amoxicilline 1 g', description: 'Antibiotique fort', categorie: 'antibiotique', prix_fcfa: 4500, stock_disponible: 40, necessite_ordonnance: true },
    { nom: 'Azithromycine 500 mg', description: 'Antibiotique — 3 cp', categorie: 'antibiotique', prix_fcfa: 3800, stock_disponible: 35, necessite_ordonnance: true },
    { nom: 'Artéméther-Luméfantrine', description: 'Antipaludéen', categorie: 'antipaludéen', prix_fcfa: 5200, stock_disponible: 45, necessite_ordonnance: true },
    { nom: 'Metformine 850 mg', description: 'Diabète type 2', categorie: 'antidiabétique', prix_fcfa: 2800, stock_disponible: 30, necessite_ordonnance: true },
    { nom: 'Amlodipine 5 mg', description: 'Hypertension', categorie: 'cardiologie', prix_fcfa: 2900, stock_disponible: 28, necessite_ordonnance: true },
    { nom: 'Oméprazole 20 mg', description: 'Ulcère / reflux', categorie: 'gastro', prix_fcfa: 3200, stock_disponible: 40, necessite_ordonnance: true },
    { nom: 'Sérum physiologique 250 ml', description: 'Lavage nasal', categorie: 'matériel médical', prix_fcfa: 900, stock_disponible: 60, necessite_ordonnance: false },
    { nom: 'Vitamine C 500 mg', description: 'Complément', categorie: 'vitamines', prix_fcfa: 1500, stock_disponible: 90, necessite_ordonnance: false },
    { nom: 'Cotrimoxazole 480 mg', description: 'Antibiotique large spectre', categorie: 'antibiotique', prix_fcfa: 2200, stock_disponible: 38, necessite_ordonnance: true },
    { nom: 'Losartan 50 mg', description: 'Antihypertenseur', categorie: 'cardiologie', prix_fcfa: 3100, stock_disponible: 25, necessite_ordonnance: true },
    { nom: 'Salbutamol inhalateur', description: 'Asthme', categorie: 'respiratoire', prix_fcfa: 4500, stock_disponible: 20, necessite_ordonnance: true },
  ];

  for (const ph of pharmacies) {
    const count = await ProduitPharmacie.count({ where: { pharmacie_id: ph.id } });
    if (count >= 10) continue;

    const existing = await ProduitPharmacie.findAll({
      where: { pharmacie_id: ph.id },
      attributes: ['nom'],
    });
    const existingNames = new Set(existing.map((p) => p.nom.toLowerCase()));
    const toAdd = catalogue
      .filter((p) => !existingNames.has(p.nom.toLowerCase()))
      .map((p) => ({ ...p, pharmacie_id: ph.id }));

    if (toAdd.length) {
      await ProduitPharmacie.bulkCreate(toAdd);
      console.log(`Catalogue pharmacie enrichi : ${ph.nom} (+${toAdd.length} produits)`);
    }
  }
};

module.exports = { seedDemoData, seedDemoAccounts, seedPublications, seedDispensaireDemo, seedAdminAccount, seedPharmacieProducts };
