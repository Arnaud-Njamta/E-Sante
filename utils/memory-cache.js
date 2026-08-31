/**
 * Cache mémoire TTL simple — profils auth, overview admin, etc.
 * Éviction LRU quand maxSize est atteint.
 */
class MemoryCache {
  constructor({ ttlMs = 60_000, maxSize = 5000 } = {}) {
    this.ttlMs = ttlMs;
    this.maxSize = maxSize;
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return null;
    }
    // LRU : remonter en tête
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value;
  }

  set(key, value) {
    if (this.store.has(key)) this.store.delete(key);
    while (this.store.size >= this.maxSize) {
      const oldest = this.store.keys().next().value;
      this.store.delete(oldest);
    }
    this.store.set(key, {
      value,
      expires: Date.now() + this.ttlMs,
    });
  }

  delete(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

module.exports = { MemoryCache };
