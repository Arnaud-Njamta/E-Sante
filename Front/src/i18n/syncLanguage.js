import i18n from './index';

export const SUPPORTED_LANGS = ['fr', 'en'];

export function normalizeLang(lang) {
  if (!lang) return null;
  return String(lang).split('-')[0].toLowerCase();
}

export function normalizeSupportedLang(lang) {
  const lng = normalizeLang(lang);
  return SUPPORTED_LANGS.includes(lng) ? lng : 'fr';
}

/** Applique la langue du profil patient (prioritaire sur localStorage au login). */
export function applyLanguageFromProfile(profile) {
  const lng = normalizeSupportedLang(profile?.langue);
  const current = normalizeSupportedLang(i18n.language);
  if (lng !== current) {
    i18n.changeLanguage(lng);
  }
}

export function getActiveLocale() {
  const lng = normalizeSupportedLang(i18n.language);
  return lng === 'en' ? 'en-US' : 'fr-FR';
}
