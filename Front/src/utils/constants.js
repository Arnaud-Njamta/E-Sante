/** Constantes métier e-santé */

export const PRISE_STATUS = {
    PENDING: 'en_attente',
    TAKEN: 'prise',
    MISSED: 'manquee',
    SKIPPED: 'sautee',
    LATE: 'en_retard',
};

export const PRISE_STATUS_LABELS = {
    [PRISE_STATUS.PENDING]: 'En attente',
    [PRISE_STATUS.TAKEN]: 'Prise',
    [PRISE_STATUS.MISSED]: 'Manquée',
    [PRISE_STATUS.SKIPPED]: 'Sautée',
    [PRISE_STATUS.LATE]: 'En retard',
};

export const PRISE_STATUS_COLORS = {
    [PRISE_STATUS.PENDING]: 'primary',
    [PRISE_STATUS.TAKEN]: 'success',
    [PRISE_STATUS.MISSED]: 'danger',
    [PRISE_STATUS.SKIPPED]: 'neutral',
    [PRISE_STATUS.LATE]: 'warning',
};

export const RISK_LEVELS = {
    LOW: 'faible',
    MEDIUM: 'moyen',
    HIGH: 'eleve',
};

export const RISK_LABELS = {
    [RISK_LEVELS.LOW]: 'Faible',
    [RISK_LEVELS.MEDIUM]: 'Moyen',
    [RISK_LEVELS.HIGH]: 'Élevé',
};

export const FREQUENCES = {
    QUOTIDIEN: 'quotidien',
    HEBDOMADAIRE: 'hebdomadaire',
    MENSUEL: 'mensuel',
    PONCTUEL: 'ponctuel',
};

export const FREQUENCE_LABELS = {
    [FREQUENCES.QUOTIDIEN]: 'Quotidien',
    [FREQUENCES.HEBDOMADAIRE]: 'Hebdomadaire',
    [FREQUENCES.MENSUEL]: 'Mensuel',
    [FREQUENCES.PONCTUEL]: 'Ponctuel',
};

export const MOMENTS = {
    MATIN: 'matin',
    MIDI: 'midi',
    SOIR: 'soir',
    COUCHER: 'coucher',
};

export const MOMENT_LABELS = {
    [MOMENTS.MATIN]: '🌅 Matin',
    [MOMENTS.MIDI]: '☀️ Midi',
    [MOMENTS.SOIR]: '🌆 Soir',
    [MOMENTS.COUCHER]: '🌙 Coucher',
};
