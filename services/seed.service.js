const { Etablissement, ServiceEtablissement, Medecin } = require('../models');

const seedDemoData = async () => {
  const count = await Etablissement.count();
  if (count > 0) return;

  console.log('Insertion des données de démonstration (annuaire santé)...');

  const pharmacie = await Etablissement.create({
    type: 'pharmacie',
    nom: 'Pharmacie Centrale',
    description: 'Pharmacie de garde avec service de conseil pharmaceutique et vérification de disponibilité en temps réel.',
    adresse: '12 Avenue de la République',
    ville: 'Dakar',
    telephone: '+221 33 821 45 67',
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
    adresse: '45 Rue du Commerce',
    ville: 'Dakar',
    telephone: '+221 33 889 12 34',
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
    nom: 'Hôpital Principal de Dakar',
    description: 'Centre hospitalier universitaire offrant des soins complets et des urgences 24h/24.',
    adresse: '1 Avenue Nelson Mandela',
    ville: 'Dakar',
    telephone: '+221 33 839 50 50',
    email: 'contact@hpd.sn',
  });

  const clinique = await Etablissement.create({
    type: 'clinique',
    nom: 'Clinique Médicale Almadies',
    description: 'Clinique privée spécialisée en médecine générale, cardiologie et imagerie médicale.',
    adresse: 'Route des Almadies',
    ville: 'Dakar',
    telephone: '+221 33 869 70 00',
    email: 'info@clinique-almadies.sn',
  });

  await ServiceEtablissement.bulkCreate([
    { etablissement_id: hopital.id, nom: 'Urgences', categorie: 'Urgence', description: 'Prise en charge des urgences médicales', duree_minutes: null, disponible: true },
    { etablissement_id: hopital.id, nom: 'Consultation générale', categorie: 'Consultation', description: 'Consultation avec médecin généraliste', prix_indicatif: 15000, duree_minutes: 30, disponible: true },
    { etablissement_id: hopital.id, nom: 'Radiologie', categorie: 'Imagerie', description: 'Scanner, IRM, radiographie', prix_indicatif: 45000, duree_minutes: 45, disponible: true },
    { etablissement_id: hopital.id, nom: 'Laboratoire d\'analyses', categorie: 'Analyses', description: 'Prises de sang et analyses biologiques', prix_indicatif: 8000, duree_minutes: 15, disponible: true },
    { etablissement_id: clinique.id, nom: 'Consultation cardiologie', categorie: 'Spécialité', description: 'Suivi cardiaque et ECG', prix_indicatif: 25000, duree_minutes: 45, disponible: true },
    { etablissement_id: clinique.id, nom: 'Échographie', categorie: 'Imagerie', description: 'Échographie abdominale et pelvienne', prix_indicatif: 30000, duree_minutes: 30, disponible: true },
    { etablissement_id: clinique.id, nom: 'Vaccination', categorie: 'Prévention', description: 'Vaccins et rappels', prix_indicatif: 12000, duree_minutes: 15, disponible: true },
    { etablissement_id: pharmacie.id, nom: 'Délivrance d\'ordonnance', categorie: 'Médicament', description: 'Préparation et délivrance sur ordonnance', disponible: true },
    { etablissement_id: pharmacie.id, nom: 'Conseil pharmaceutique', categorie: 'Conseil', description: 'Conseil sur les médicaments sans ordonnance', disponible: true },
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

module.exports = { seedDemoData };
