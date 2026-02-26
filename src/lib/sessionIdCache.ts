import "server-only";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "./prisma";
import { PrismaClient } from "@prisma/client";

class SessionIdCache {
  private static instance: SessionIdCache;
  private instanceId: string;
  private prismaClient: PrismaClient;

  private constructor() {
    this.instanceId = uuidv4();
    this.prismaClient = prisma;
  }

  public static getInstance() {
    if (!SessionIdCache.instance) {
      SessionIdCache.instance = new SessionIdCache();
    }
    return SessionIdCache.instance;
  }

  private async withRetry<T>(
    operationName: string,
    operation: () => Promise<T>,
    fallbackResult?: T
  ): Promise<T | undefined> {
    const maxRetries = 3;
    const delays = [1000, 1300, 1600];

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt < maxRetries) {
          console.warn(
            `[ sessionIdCache ] Cache instanceId: ${this.instanceId} - Error during ${operationName} (attempt ${attempt + 1}/${maxRetries} failed). Retrying in ${delays[attempt]}ms...`,
            error
          );
          await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
        } else {
          console.error(
            `[ sessionIdCache ] Cache instanceId: ${this.instanceId} - Error during ${operationName} (all ${maxRetries} retries failed):`,
            error
          );

          // Throw error for operations without a fallback result (like 'set')
          if (fallbackResult === undefined) {
            throw error;
          }

          return fallbackResult;
        }
      }
    }
  }

  public async set(key: string, value: string) {
    if (!key || !value) {
      console.log(
        `[ sessionIdCache ] Cache instanceId: ${this.instanceId} - Missing key: ${key} or value: ${value}`
      );
      return;
    }

    await this.withRetry('set', async () => {
      // Upsert the key-value pair - this will create or update the existing key
      await this.prismaClient.keyValue.upsert({
        where: { key },
        update: { value, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
        create: { key, value, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
      });

      console.log(
        `[ sessionIdCache ] Cache instanceId: ${this.instanceId} - sessionId saved for key: ${key}`
      );
    });
  }

  public async get(key: string): Promise<string | undefined> {
    return this.withRetry<string | undefined>('get', async () => {
      const result = await this.prismaClient.keyValue.findFirst({
        where: {
          AND: [{ key }, { expiresAt: { gt: new Date() } }],
        },
      });

      console.log(
        `[ sessionIdCache ] Cache instanceId: ${this.instanceId} - get`,
        key,
        result?.value
      );

      return result?.value;
    }, undefined);
  }

  public async delete(key: string) {
    await this.withRetry('delete', async () => {
      await this.prismaClient.keyValue.delete({
        where: { key },
      });
    }, undefined); // Using undefined as fallback so it swallows errors like original implementation
  }

  public async clear() {
    await this.withRetry('clear', async () => {
      await this.prismaClient.keyValue.deleteMany();
    }, undefined);
  }

  public async clearAllSessionsForSameNumber(number: string) {
    console.log(
      `[ sessionIdCache ] Cache instanceId: ${this.instanceId} - clearAllSessionsForSameNumber`,
      number
    );

    await this.withRetry('clearAllSessionsForSameNumber', async () => {
      await this.prismaClient.keyValue.deleteMany({
        where: { value: number },
      });
    }, undefined);
  }
}

export const sessionIdCache = SessionIdCache.getInstance();
