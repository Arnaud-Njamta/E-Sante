const { canAccessFichier } = require('../services/fichier.service');

jest.mock('../models', () => ({
  Fichier: {},
  OrdonnanceElectronique: { findOne: jest.fn() },
  ProduitPharmacie: { findByPk: jest.fn() },
}));

const { OrdonnanceElectronique } = require('../models');

describe('fichier.service — canAccessFichier', () => {
  const publicPhoto = { type_fichier: 'photo_profil', proprietaire_type: 'medecin', proprietaire_id: 'm1' };
  const cachet = { type_fichier: 'cachet', proprietaire_type: 'medecin', proprietaire_id: 'm1' };
  const diplome = { type_fichier: 'diplome', proprietaire_type: 'medecin', proprietaire_id: 'm1' };

  test('refuse accès sans utilisateur', async () => {
    expect(await canAccessFichier(null, publicPhoto)).toBe(false);
  });

  test('autorise photo profil pour patient authentifié', async () => {
    const user = { id: 'p1', role: 'patient' };
    expect(await canAccessFichier(user, publicPhoto)).toBe(true);
  });

  test('refuse diplôme à un autre médecin', async () => {
    const user = { id: 'm2', role: 'medecin' };
    expect(await canAccessFichier(user, diplome)).toBe(false);
  });

  test('autorise cachet au médecin propriétaire', async () => {
    const user = { id: 'm1', role: 'medecin' };
    expect(await canAccessFichier(user, cachet)).toBe(true);
  });

  test('autorise cachet au patient concerné par ordonnance', async () => {
    OrdonnanceElectronique.findOne.mockResolvedValue({
      patient_id: 'p1', medecin_id: 'm1', statut: 'signee',
    });
    const user = { id: 'p1', role: 'patient' };
    expect(await canAccessFichier(user, cachet)).toBe(true);
  });
});

describe('privacy config', () => {
  test('politique version définie', () => {
    const { POLITIQUE_CONFIDENTIALITE_VERSION } = require('../config/privacy');
    expect(POLITIQUE_CONFIDENTIALITE_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
