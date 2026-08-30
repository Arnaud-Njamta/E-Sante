const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/** URL de fichier API avec jeton pour balises &lt;img&gt; (auth requise côté serveur). */
export function authenticatedFileUrl(fichierId, cacheBust) {
  if (!fichierId) return null;
  const token = localStorage.getItem('esante_access_token') || '';
  const t = cacheBust ? `&t=${cacheBust}` : '';
  return `${API_BASE}/fichiers/${fichierId}?access_token=${encodeURIComponent(token)}${t}`;
}

export default authenticatedFileUrl;
