const STORAGE_KEY = 'djamsante_offline_queue';

export function getOfflineQueue() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOfflineQueue(queue) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function enqueueOfflineAction(action) {
  const queue = getOfflineQueue();
  queue.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    ...action,
    createdAt: new Date().toISOString(),
  });
  saveOfflineQueue(queue);
  return queue.length;
}

export function removeFromQueue(id) {
  const queue = getOfflineQueue().filter((item) => item.id !== id);
  saveOfflineQueue(queue);
  return queue;
}

export function isOnline() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}
