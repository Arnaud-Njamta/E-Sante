/** Formate une heure "HH:MM:SS" ou "HH:MM" → "08h30" */
export function formatHeurePrise(heure) {
  if (!heure) return '';
  const [h, m] = String(heure).split(':');
  return `${h}h${m || '00'}`;
}

/** Prise encore actionnable (confirmer / reporter) */
export function isPrisePending(statut) {
  return statut === 'en_attente' || statut === 'reporte';
}

export function isPriseDone(statut) {
  return statut === 'pris' || statut === 'retard';
}
