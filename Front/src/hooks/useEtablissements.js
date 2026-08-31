import { useQuery } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

export function useEtablissements(filters = {}, options = {}) {
    return useQuery({
        queryKey: ['etablissements', filters],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.etablissements.base, { params: filters });
            return data.data;
        },
        enabled: options.enabled !== false,
        retry: 1,
    });
}

export function useEtablissement(id) {
    return useQuery({
        queryKey: ['etablissements', id],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.etablissements.byId(id));
            return data.data;
        },
        enabled: !!id,
    });
}

export function useEtablissementHoraires(id) {
    return useQuery({
        queryKey: ['etablissements', id, 'horaires'],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.etablissements.horaires(id));
            return data.data;
        },
        enabled: !!id,
    });
}

export function useEtablissementPublications(id) {
    return useQuery({
        queryKey: ['etablissements', id, 'publications'],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.etablissements.publications(id));
            return data.data;
        },
        enabled: !!id,
    });
}
