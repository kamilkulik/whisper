import { PrismaClient } from "@prisma/client";
import { prisma } from "./prisma";

export class KeyValueCache {
  private static instance: KeyValueCache;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = prisma;
  }

  public static getInstance() {
    if (!KeyValueCache.instance) {
      KeyValueCache.instance = new KeyValueCache();
    }
    return KeyValueCache.instance;
  }

  public async fetchWithCache(
    key: string,
    callback: () => Promise<string | null>
  ): Promise<string | null> {
    try {
      const value = await this.get(key);
      if (value) {
        console.log(`Cache hit for key: ${key}`);
        return value;
      }

      const result = await callback();
      if (result) {
        await this.set(key, result);
      }

      return result;
    } catch (error) {
      console.error(`Error fetching with cache: ${key}`, error);
      throw error;
    }
  }

  private async get(key: string): Promise<string | null> {
    return (
      (
        await this.prisma.keyValue.findUnique({
          where: { key },
        })
      )?.value ?? null
    );
  }

  private async set(key: string, value: string): Promise<void> {
    await this.prisma.keyValue.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
}
