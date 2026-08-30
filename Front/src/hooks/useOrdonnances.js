import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

const formatOrdonnance = (ordo) => {
    const raw = ordo?.toJSON ? ordo.toJSON() : { ...ordo };
    const donnees = typeof raw.donnees_parsees === 'string'
        ? JSON.parse(raw.donnees_parsees || '{}')
        : (raw.donnees_parsees || {});
    const medicaments = donnees.medicaments || [];
    return {
        ...raw,
        donnees_parsees: donnees,
        medicaments_extraits: medicaments,
        nom_fichier: raw.image_url?.split('/').pop() || `Ordonnance`,
    };
};

export function useOrdonnances() {
    return useQuery({
        queryKey: ['ordonnances'],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.ordonnances.base);
            const list = data.data || data.ordonnances || data;
            return Array.isArray(list) ? list.map(formatOrdonnance) : [];
        },
    });
}

export function useScanOrdonnance() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (file) => {
            const formData = new FormData();
            formData.append('image', file);
            // Ne pas fixer Content-Type : axios ajoute le boundary multipart automatiquement
            const { data } = await client.post(ENDPOINTS.ordonnances.scan, formData);
            return data.data || data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ordonnances'] }),
    });
}

export function useValiderOrdonnance() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, corrections }) => {
            const body = Array.isArray(corrections) && corrections.length > 0
                ? { medicaments: corrections }
                : {};
            const { data } = await client.post(ENDPOINTS.ordonnances.valider(id), body);
            return data.data || data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ordonnances'] });
            queryClient.invalidateQueries({ queryKey: ['traitements'] });
        },
    });
}
