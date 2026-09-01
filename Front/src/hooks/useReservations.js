import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

export function useMesReservations() {
  return useQuery({
    queryKey: ['reservations', 'patient'],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.reservations.mesReservations);
      const payload = data.data;
      return Array.isArray(payload) ? payload : payload?.reservations || [];
    },
  });
}

export function useReservationsEtablissement(filters = {}) {
  return useQuery({
    queryKey: ['reservations', 'etablissement', filters],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.reservations.etablissement, { params: filters });
      return data.data;
    },
  });
}

export function useCreerReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await client.post(ENDPOINTS.reservations.base, payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservations'] });
      qc.refetchQueries({ queryKey: ['reservations', 'patient'] });
    },
  });
}

export function useAnnulerReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await client.delete(ENDPOINTS.reservations.annuler(id));
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reservations'] }),
  });
}

export function useUpdateReservationStatut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const { data } = await client.put(ENDPOINTS.reservations.statut(id), payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reservations'] }),
  });
}

export function useOrdonnancesElecPatient() {
  return useQuery({
    queryKey: ['ordonnances-elec', 'patient'],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.ordonnancesElec.patient);
      return data.data;
    },
  });
}

export function useDisponibiliteOrdonnance(ordonnanceId, etablissementId) {
  return useQuery({
    queryKey: ['ordonnances-elec', 'dispo', ordonnanceId, etablissementId],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.ordonnancesElec.disponibilite(ordonnanceId, etablissementId));
      return data.data;
    },
    enabled: !!ordonnanceId && !!etablissementId,
  });
}

export function useReserverDepuisOrdonnance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ordonnanceId, ...payload }) => {
      const { data } = await client.post(ENDPOINTS.ordonnancesElec.reserver(ordonnanceId), payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ordonnances-elec'] });
      qc.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
}
