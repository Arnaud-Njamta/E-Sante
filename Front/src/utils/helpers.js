/**
 * Format a date to a French locale string
 */
export function formatDate(date, options = {}) {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        ...options,
    });
}

/**
 * Format a time string (HH:MM) for display
 */
export function formatTime(time) {
    if (!time) return '--:--';
    const [hours, minutes] = time.split(':');
    return `${hours}h${minutes}`;
}

/**
 * Get today's formatted date
 */
export function getTodayFormatted() {
    return formatDate(new Date(), {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

/**
 * Get initials from a name
 */
export function getInitials(name) {
    if (!name) return '?';
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

/**
 * Compute observance percentage
 */
export function computeObservance(taken, total) {
    if (!total || total === 0) return 0;
    return Math.round((taken / total) * 100);
}

/**
 * Get greeting based on current hour
 */
export function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
}

/**
 * Truncate text to a max length
 */
export function truncate(str, max = 50) {
    if (!str || str.length <= max) return str;
    return str.substring(0, max) + '…';
}
