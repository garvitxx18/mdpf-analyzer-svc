// Cache service removed - no longer using Redis

type CacheOptions = {
  url: string;
};

export class CacheService {
  private client: any;
  private readonly defaultTTL = 6 * 60 * 60;

  constructor(_options: CacheOptions) {
    // Redis removed - using in-memory or database-based caching instead
    this.client = null as any;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);

      if (!data) {
        return null;
      }

      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(
    key: string,
    value: T,
    ttlInSeconds?: number
  ): Promise<void> {
    try {
      const ttl = ttlInSeconds ?? this.defaultTTL;
      await this.client.set(key, JSON.stringify(value), "EX", ttl);
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}

