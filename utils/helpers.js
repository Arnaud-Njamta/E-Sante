/**
 * Parse une heure au format "HH:MM" en objet { heures, minutes }
 */
const parseTime = (timeStr) => {
  const [heures, minutes] = timeStr.split(':').map(Number);
  return { heures, minutes };
};

/**
 * Convertit des heures/minutes en minutes totales depuis minuit
 */
const timeToMinutes = (timeStr) => {
  const { heures, minutes } = parseTime(timeStr);
  return heures * 60 + minutes;
};

/**
 * Convertit des minutes totales en format "HH:MM"
 */
const minutesToTime = (totalMinutes) => {
  const heures = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(heures).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/**
 * Calcule la différence en minutes entre deux heures
 */
const diffMinutes = (time1, time2) => {
  return Math.abs(timeToMinutes(time1) - timeToMinutes(time2));
};

/**
 * Retourne le début de la journée (00:00:00) pour une date donnée
 */
const startOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Retourne la fin de la journée (23:59:59) pour une date donnée
 */
const endOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Normalise un champ JSON MySQL/Sequelize (parfois renvoyé en string)
 */
const parseJsonField = (value, fallback = null) => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return fallback;
};

/**
 * Date locale YYYY-MM-DD (évite le décalage UTC de toISOString)
 */
const localDateString = (date = new Date()) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

module.exports = {
  parseTime,
  timeToMinutes,
  minutesToTime,
  diffMinutes,
  startOfDay,
  endOfDay,
  parseJsonField,
  localDateString,
};
