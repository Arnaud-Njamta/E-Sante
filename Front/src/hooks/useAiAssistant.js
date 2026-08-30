import { useMutation } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

export function useAiChat() {
  return useMutation({
    mutationFn: async ({ message, history }) => {
      const { data } = await client.post(ENDPOINTS.ai.chat, { message, history });
      return data.data;
    },
  });
}

export function useAiBookRdv() {
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await client.post(ENDPOINTS.ai.bookRdv, payload);
      return data.data;
    },
  });
}
