import i18n from './index';

export const SUPPORTED_LANGS = ['fr', 'en'];
const STORAGE_KEY = 'djamsante_lang';

export function normalizeLang(lang) {
  if (!lang) return null;
  return String(lang).split('-')[0].toLowerCase();
}

export function normalizeSupportedLang(lang) {
  const lng = normalizeLang(lang);
  return SUPPORTED_LANGS.includes(lng) ? lng : 'fr';
}

export function getStoredLanguage() {
  if (typeof localStorage === 'undefined') return null;
  const lng = normalizeLang(localStorage.getItem(STORAGE_KEY));
  return SUPPORTED_LANGS.includes(lng) ? lng : null;
}

/** Langue préférée : choix navigateur d'abord, puis profil patient. */
export function resolvePreferredLanguage(profile) {
  const stored = getStoredLanguage();
  if (stored) return stored;
  if (profile?.langue) return normalizeSupportedLang(profile.langue);
  return normalizeSupportedLang(i18n.language);
}

/** Applique la langue sans écraser le choix déjà enregistré dans le navigateur. */
export function applyLanguageFromProfile(profile) {
  const preferred = resolvePreferredLanguage(profile);
  const current = normalizeSupportedLang(i18n.language);
  if (preferred !== current) {
    i18n.changeLanguage(preferred);
  }
}

export function getActiveLocale() {
  const lng = normalizeSupportedLang(i18n.language);
  return lng === 'en' ? 'en-US' : 'fr-FR';
}
