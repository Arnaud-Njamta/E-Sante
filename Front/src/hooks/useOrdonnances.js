import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

const formatOrdonnance = (ordo) => {
    const raw = ordo?.toJSON ? ordo.toJSON() : { ...ordo };
    const donnees = typeof raw.donnees_parsees === 'string'
        ? JSON.parse(raw.donnees_parsees || '{}')
        : (raw.donnees_parsees || {});
    const medicaments = donnees.medicaments || [];
    const verification = donnees.verification_ia || raw.verification_ia || null;
    return {
        ...raw,
        donnees_parsees: donnees,
        medicaments_extraits: medicaments,
        verification_ia: verification,
        acceptable_pharmacie: raw.acceptable_pharmacie
            || ['valide', 'acceptable', 'acceptable_pour_revue_humaine'].includes(verification?.verdict)
            || raw.statut === 'validee',
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ordonnances'] });
            queryClient.invalidateQueries({ queryKey: ['ordonnances', 'pharmacie'] });
        },
    });
}

export function useOrdonnancesPharmacie() {
    return useQuery({
        queryKey: ['ordonnances', 'pharmacie'],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.ordonnances.pharmacie);
            return data.data || [];
        },
    });
}

export function useDownloadOrdonnanceElec() {
    return useMutation({
        mutationFn: async (id) => {
            const response = await client.get(ENDPOINTS.ordonnancesElec.telecharger(id), {
                responseType: 'blob',
            });
            const blob = response.data;
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ordonnance-${id.slice(0, 8)}.html`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        },
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
