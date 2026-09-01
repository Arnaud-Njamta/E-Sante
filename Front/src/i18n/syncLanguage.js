import i18n from './index';

export function normalizeLang(lang) {
  if (!lang) return null;
  return String(lang).split('-')[0].toLowerCase();
}

/** Applique la langue du profil patient (prioritaire sur localStorage au login). */
export function applyLanguageFromProfile(profile) {
  const lng = normalizeLang(profile?.langue);
  if (!lng) return;
  const current = normalizeLang(i18n.language);
  if (lng !== current) {
    i18n.changeLanguage(lng);
  }
}

export function getActiveLocale() {
  const lng = normalizeLang(i18n.language) || 'fr';
  const localeMap = {
    fr: 'fr-FR',
    en: 'en-US',
    ewo: 'fr-FR',
    bas: 'fr-FR',
    dua: 'fr-FR',
    ff: 'fr-FR',
  };
  return localeMap[lng] || 'fr-FR';
}
