export const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

export const defaultHoraires = () => Object.fromEntries(JOURS.map((j) => [
  j,
  ['samedi', 'dimanche'].includes(j)
    ? { actif: false, creneaux: [] }
    : { actif: true, creneaux: [{ debut: '08:00', fin: '12:00' }, { debut: '14:00', fin: '18:00' }] },
]));

export function formatHorairesSummary(horaires) {
  if (!horaires) return null;
  const active = JOURS.filter((j) => horaires[j]?.actif);
  if (!active.length) return 'Fermé';
  return active.map((j) => `${j.slice(0, 3)}. ${horaires[j].creneaux?.map((c) => `${c.debut}-${c.fin}`).join(', ') || ''}`).join(' · ');
}
