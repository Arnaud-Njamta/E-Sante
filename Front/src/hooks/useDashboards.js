import { useQuery } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

export function useMedecinDashboard(options = {}) {
    return useQuery({
        queryKey: ['medecin', 'dashboard'],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.medecins.meDashboard);
            return data.data;
        },
        ...options,
    });
}

export function usePharmacieDashboard(options = {}) {
    return useQuery({
        queryKey: ['pharmacie', 'dashboard'],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.etablissements.pharmacieDashboard);
            return data.data;
        },
        ...options,
    });
}

export function useStructureDashboard() {
    return useQuery({
        queryKey: ['structure', 'dashboard'],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.etablissements.structureDashboard);
            return data.data;
        },
    });
}

export function useEtabHorairesMe(options = {}) {
    return useQuery({
        queryKey: ['etablissement', 'horaires', 'me'],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.etablissements.structureDashboard);
            return data.data?.horaires || data.data?.profil?.horaires_ouverture || {};
        },
        ...options,
    });
}
