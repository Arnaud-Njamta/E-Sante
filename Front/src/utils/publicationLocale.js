import { normalizeSupportedLang } from '../i18n/syncLanguage';

/** Retourne titre et contenu dans la langue active (FR par défaut). */
export function localizePublication(pub, lang) {
  if (!pub) return pub;
  const lng = normalizeSupportedLang(lang);
  if (lng === 'en') {
    return {
      ...pub,
      titre: pub.titre_en?.trim() || pub.titre,
      contenu: pub.contenu_en?.trim() || pub.contenu,
    };
  }
  return pub;
}
