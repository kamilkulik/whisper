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

  public async set(key: string, value: string) {
    if (!key || !value) {
      console.log(
        `[ sessionIdCache ] Cache instanceId: ${this.instanceId} - Missing key: ${key} or value: ${value}`
      );
      return;
    }

    const maxRetries = 3;
    const delays = [1000, 2000, 3000];

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Upsert the key-value pair - this will create or update the existing key
        await this.prismaClient.keyValue.upsert({
          where: { key },
          update: { value, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
          create: { key, value, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
        });

        console.log(
          `[ sessionIdCache ] Cache instanceId: ${this.instanceId} - sessionId saved for key: ${key}`
        );
        return; // Success, exit the loop
      } catch (error) {
        if (attempt < maxRetries) {
          console.warn(
            `[ sessionIdCache ] Cache instanceId: ${this.instanceId} - Error setting sessionId (attempt ${attempt + 1}/${maxRetries} failed). Retrying in ${delays[attempt]}ms...`,
            error
          );
          await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
        } else {
          console.error(
            `[ sessionIdCache ] Cache instanceId: ${this.instanceId} - Error setting sessionId (all ${maxRetries} retries failed):`,
            error
          );
          throw error; // Throw after all retries fail so the caller fails the request
        }
      }
    }
  }

  public async get(key: string): Promise<string | undefined> {
    try {
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
    } catch (error) {
      console.error(
        `[ sessionIdCache ] Cache instanceId: ${this.instanceId} - Error getting sessionId:`,
        error
      );
      return undefined;
    }
  }

  public async delete(key: string) {
    try {
      await this.prismaClient.keyValue.delete({
        where: { key },
      });
    } catch (error) {
      console.error(
        `[ sessionIdCache ] Cache instanceId: ${this.instanceId} - Error deleting sessionId:`,
        error
      );
    }
  }

  public async clear() {
    try {
      await this.prismaClient.keyValue.deleteMany();
    } catch (error) {
      console.error(
        `[ sessionIdCache ] Cache instanceId: ${this.instanceId} - Error clearing cache:`,
        error
      );
    }
  }

  public async clearAllSessionsForSameNumber(number: string) {
    console.log(
      `[ sessionIdCache ] Cache instanceId: ${this.instanceId} - clearAllSessionsForSameNumber`,
      number
    );

    try {
      await this.prismaClient.keyValue.deleteMany({
        where: { value: number },
      });
    } catch (error) {
      console.error(
        `[ sessionIdCache ] Cache instanceId: ${this.instanceId} - Error clearing sessions for number:`,
        error
      );
    }
  }
}

export const sessionIdCache = SessionIdCache.getInstance();
