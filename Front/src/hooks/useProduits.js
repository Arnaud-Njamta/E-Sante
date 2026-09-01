import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

export function useMesProduits() {
    return useQuery({
        queryKey: ['produits', 'mes'],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.produits.mesProduits);
            return data.data;
        },
    });
}

/** @deprecated use useMesProduits */
export function useProduitsPharmacie() {
    return useMesProduits();
}

export function useProduitsPublic(etablissementId) {
    return useQuery({
        queryKey: ['produits', 'public', etablissementId],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.produits.etablissement(etablissementId));
            return data.data.produits;
        },
        enabled: !!etablissementId,
    });
}

export function useRechercheProduits(params, { enabled = true } = {}) {
  return useQuery({
        queryKey: ['produits', 'recherche', params],
        queryFn: async () => {
            const queryParams = { ...params };
            if (!queryParams.recherche?.trim()) delete queryParams.recherche;
            if (!queryParams.ville?.trim()) delete queryParams.ville;
            if (!queryParams.type_etablissement?.trim()) delete queryParams.type_etablissement;
            const { data } = await client.get(ENDPOINTS.produits.recherche, { params: queryParams });
            return data.data;
        },
        enabled,
        staleTime: 15_000,
    });
}

export function useCreerProduit() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (formData) => {
            const { data } = await client.post(ENDPOINTS.produits.base, formData);
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['produits'] }),
    });
}

export function useUpdateProduit() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, formData }) => {
            const { data } = await client.put(ENDPOINTS.produits.byId(id), formData);
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['produits'] }),
    });
}

export function useDeleteProduit() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { data } = await client.delete(ENDPOINTS.produits.byId(id));
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['produits'] }),
    });
}
