import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';
import { messageriePollOptions } from '../config/queryDefaults';

export function usePharmaciesChat() {
    return useQuery({
        queryKey: ['messagerie', 'pharmacies'],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.messagerie.pharmacies);
            return data.data;
        },
    });
}

export function useConversations() {
    return useQuery({
        queryKey: ['messagerie', 'conversations'],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.messagerie.conversations);
            return data.data;
        },
    });
}

export function useConversation(id) {
    return useQuery({
        queryKey: ['messagerie', 'conversations', id],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.messagerie.conversation(id));
            return data.data;
        },
        enabled: !!id,
        ...messageriePollOptions,
    });
}

export function useDemarrerConversation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ pharmacieId, etablissementId, ...payload }) => {
            const id = etablissementId || pharmacieId;
            const { data } = await client.post(
                ENDPOINTS.messagerie.demarrerEtab(id),
                payload,
            );
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messagerie'] });
        },
    });
}

export function useEnvoyerMessage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ conversationId, contenu }) => {
            const { data } = await client.post(
                ENDPOINTS.messagerie.message(conversationId),
                { contenu },
            );
            return data.data;
        },
        onSuccess: (_, { conversationId }) => {
            queryClient.invalidateQueries({ queryKey: ['messagerie', 'conversations', conversationId] });
            queryClient.invalidateQueries({ queryKey: ['messagerie', 'conversations'] });
        },
    });
}

export function useAvis(cibleType, cibleId) {
    return useQuery({
        queryKey: ['avis', cibleType, cibleId],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.avis.base, {
                params: { cible_type: cibleType, cible_id: cibleId },
            });
            return data.data;
        },
        enabled: !!cibleType && !!cibleId,
    });
}

export function useCreerAvis() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            const { data } = await client.post(ENDPOINTS.avis.base, payload);
            return data.data;
        },
        onSuccess: (_, { cible_type, cible_id }) => {
            queryClient.invalidateQueries({ queryKey: ['avis', cible_type, cible_id] });
            queryClient.invalidateQueries({ queryKey: ['etablissements'] });
            queryClient.invalidateQueries({ queryKey: ['medecins'] });
        },
    });
}
