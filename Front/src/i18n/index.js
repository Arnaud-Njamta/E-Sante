import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import fr from './locales/fr.json';
import en from './locales/en.json';
import { normalizeSupportedLang } from './syncLanguage';

const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('djamsante_lang') : null;
const initialLng = normalizeSupportedLang(saved);

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
  },
  lng: initialLng,
  fallbackLng: 'fr',
  supportedLngs: ['fr', 'en'],
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

i18n.on('languageChanged', (lng) => {
  const normalized = normalizeSupportedLang(lng);
  localStorage.setItem('djamsante_lang', normalized);
  document.documentElement.lang = normalized;
  if (normalized !== lng) {
    i18n.changeLanguage(normalized);
  }
});

export default i18n;
