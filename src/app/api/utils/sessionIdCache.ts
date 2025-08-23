import "server-only";

class SessionIdCache {
  private cache: Map<string, string>;
  private static instance: SessionIdCache;

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance() {
    if (!SessionIdCache.instance) {
      SessionIdCache.instance = new SessionIdCache();
    }
    return SessionIdCache.instance;
  }

  public set(key: string, value: string) {
    if (!key || !value) {
      console.log("Missing key or value", key, value);
      return;
    }
    console.log("set", key, value);
    this.cache.set(key, value);

    // set cache to expire in 2 minutes
    setTimeout(() => {
      this.cache.delete(key);
    }, 120000);
  }

  public get(key: string): string | undefined {
    console.log("get", key, this.cache.get(key));
    return this.cache.get(key);
  }

  public delete(key: string) {
    this.cache.delete(key);
  }

  public clear() {
    this.cache.clear();
  }
}

export const sessionIdCache = SessionIdCache.getInstance();
