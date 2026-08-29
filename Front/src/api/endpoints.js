/** API endpoint constants — mirrors backend routes */
const ENDPOINTS = {
    auth: {
        login: '/auth/login',
        register: '/auth/register',
        refresh: '/auth/refresh',
        forgotPassword: '/auth/forgot-password',
        resetPassword: '/auth/reset-password',
    },
    patients: {
        profile: '/patients/profile',
        parametresVie: '/patients/parametres-vie',
    },
    traitements: {
        base: '/traitements',
        byId: (id) => `/traitements/${id}`,
        statut: (id) => `/traitements/${id}/statut`,
    },
    prises: {
        aujourdhui: '/prises/aujourd-hui',
        confirmer: (id) => `/prises/${id}/confirmer`,
        history: '/prises/historique',
    },
    ordonnances: {
        base: '/ordonnances',
        scan: '/ordonnances/scan',
        valider: (id) => `/ordonnances/${id}/valider`,
    },
    statistiques: {
        observance: '/statistiques/observance',
        tendances: '/statistiques/tendances',
        risque: '/statistiques/risque',
    },
    etablissements: {
        base: '/etablissements',
        byId: (id) => `/etablissements/${id}`,
        horaires: (id) => `/etablissements/${id}/horaires`,
    },
    medecins: {
        base: '/medecins',
        byId: (id) => `/medecins/${id}`,
    },
    avis: {
        base: '/avis',
    },
    messagerie: {
        pharmacies: '/messagerie/pharmacies',
        conversations: '/messagerie/conversations',
        demarrer: (pharmacieId) => `/messagerie/pharmacies/${pharmacieId}/conversations`,
        conversation: (id) => `/messagerie/conversations/${id}`,
        message: (id) => `/messagerie/conversations/${id}/messages`,
    },
};

export default ENDPOINTS;
