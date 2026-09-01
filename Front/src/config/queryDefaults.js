/** Réglages React Query adaptés à la charge (évite le polling agressif). */

export const pollingWhenVisible = (ms) => ({
  refetchInterval: ms,
  refetchIntervalInBackground: false,
});

export const adminQueryOptions = {
  staleTime: 60_000,
  gcTime: 120_000,
  refetchOnMount: true,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  refetchInterval: 60_000,
  refetchIntervalInBackground: false,
};

export const messageriePollOptions = pollingWhenVisible(15_000);

export const notificationsPollOptions = pollingWhenVisible(30_000);

export const paiementPollOptions = pollingWhenVisible(5_000);
