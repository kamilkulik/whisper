import "server-only";
import { v4 as uuidv4 } from "uuid";

class SessionIdCache {
  private cache: Map<string, string>;
  private static instance: SessionIdCache;
  private instanceId: string;

  private constructor() {
    this.cache = new Map();
    this.instanceId = uuidv4();
  }

  public static getInstance() {
    if (!SessionIdCache.instance) {
      SessionIdCache.instance = new SessionIdCache();
    }
    return SessionIdCache.instance;
  }

  public set(key: string, value: string) {
    if (!key || !value) {
      console.log(
        `Cache instanceId: ${this.instanceId} - Missing key or value`,
        key,
        value
      );
      return;
    }

    if (this.cache.get(key)) {
      console.log(
        `Cache instanceId: ${this.instanceId} - sessionId already exists`,
        key,
        value
      );
      this.clearAllSessionsForSameNumber(key);
    }

    this.cache.set(key, value);
    console.log(
      `Cache instanceId: ${this.instanceId} - sessionId saved for key: ${key}`,
      this.get(key)
    );
    console.log(
      `Cache instanceId: ${this.instanceId} - cache`,
      JSON.stringify(this.cache, null, 2)
    );

    // set cache to expire in 2 minutes
    setTimeout(() => {
      console.log(
        `Cache instanceId: ${this.instanceId} - sessionId deleted for key: ${key}`,
        this.get(key)
      );
      this.cache.delete(key);
    }, 120000);
  }

  public get(key: string): string | undefined {
    console.log(
      `Cache instanceId: ${this.instanceId} - get`,
      key,
      this.cache.get(key)
    );
    if (this.cache.get(key) === undefined) {
      console.log(
        `Cache instanceId: ${this.instanceId} - cache`,
        JSON.stringify(this.cache, null, 2)
      );
    }
    return this.cache.get(key);
  }

  public delete(key: string) {
    this.cache.delete(key);
  }

  public clear() {
    this.cache.clear();
  }

  public clearAllSessionsForSameNumber(number: string) {
    console.log(
      `Cache instanceId: ${this.instanceId} - clearAllSessionsForSameNumber`,
      number
    );
    for (const [key, value] of this.cache.entries()) {
      if (value === number) {
        this.cache.delete(key);
      }
    }
  }
}

export const sessionIdCache = SessionIdCache.getInstance();
