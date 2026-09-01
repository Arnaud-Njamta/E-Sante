import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import fr from './locales/fr.json';
import en from './locales/en.json';
import ewo from './locales/ewo.json';
import bas from './locales/bas.json';
import dua from './locales/dua.json';
import ff from './locales/ff.json';

function deepMerge(base, override) {
  const out = { ...base };
  Object.keys(override || {}).forEach((key) => {
    const val = override[key];
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      out[key] = deepMerge(base[key] || {}, val);
    } else {
      out[key] = val;
    }
  });
  return out;
}

const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('djamsante_lang') : null;

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: deepMerge(fr, en) },
    ewo: { translation: deepMerge(fr, ewo) },
    bas: { translation: deepMerge(fr, bas) },
    dua: { translation: deepMerge(fr, dua) },
    ff: { translation: deepMerge(fr, ff) },
  },
  lng: saved || 'fr',
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('djamsante_lang', lng);
  document.documentElement.lang = lng;
});

export default i18n;
