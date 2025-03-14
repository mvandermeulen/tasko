import Redis from 'ioredis';

let redis;

if (!redis) {
  redis = new Redis(process.env.REDIS_URL);

  redis.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });
}

export default class CacheHandler {
  constructor(options) {
    this.options = options;
  }

  async get(key) {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache Get Error:', error);
      return null;
    }
  }

  async set(key, data, ctx) {
    try {
      const cacheData = {
        value: data,
        lastModified: Date.now(),
        tags: ctx.tags || [],
      };
      await redis.set(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Cache Set Error:', error);
    }
  }

  async revalidateTag(tags) {
    try {
      tags = [tags].flat();
      const keys = await redis.keys('*');
      for (const key of keys) {
        const value = await redis.get(key);
        if (value && tags.length > 0) {
          const parsed = JSON.parse(value);
          if (
            Array.isArray(parsed.tags) &&
            parsed.tags.some((tag) => tags.includes(tag))
          ) {
            await redis.del(key);
          }
        }
      }
    } catch (error) {
      console.error('Cache RevalidateTag Error:', error);
    }
  }

  resetRequestCache() {
    // TODO: Implement request-specific cache reset if needed
  }
}
