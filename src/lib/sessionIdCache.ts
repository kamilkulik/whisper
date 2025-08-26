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
        `Cache instanceId: ${this.instanceId} - Missing key or value`,
        key,
        value
      );
      return;
    }

    try {
      // Upsert the key-value pair - this will create or update the existing key
      await this.prismaClient.keyValue.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });

      console.log(
        `Cache instanceId: ${this.instanceId} - sessionId saved for key: ${key}`,
        await this.get(key)
      );
    } catch (error) {
      console.error(
        `Cache instanceId: ${this.instanceId} - Error setting sessionId:`,
        error
      );
    }
  }

  public async get(key: string): Promise<string | undefined> {
    try {
      const result = await this.prismaClient.keyValue.findUnique({
        where: { key },
      });

      console.log(
        `Cache instanceId: ${this.instanceId} - get`,
        key,
        result?.value
      );

      return result?.value;
    } catch (error) {
      console.error(
        `Cache instanceId: ${this.instanceId} - Error getting sessionId:`,
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
        `Cache instanceId: ${this.instanceId} - Error deleting sessionId:`,
        error
      );
    }
  }

  public async clear() {
    try {
      await this.prismaClient.keyValue.deleteMany();
    } catch (error) {
      console.error(
        `Cache instanceId: ${this.instanceId} - Error clearing cache:`,
        error
      );
    }
  }

  public async clearAllSessionsForSameNumber(number: string) {
    console.log(
      `Cache instanceId: ${this.instanceId} - clearAllSessionsForSameNumber`,
      number
    );

    try {
      await this.prismaClient.keyValue.deleteMany({
        where: { value: number },
      });
    } catch (error) {
      console.error(
        `Cache instanceId: ${this.instanceId} - Error clearing sessions for number:`,
        error
      );
    }
  }
}

export const sessionIdCache = SessionIdCache.getInstance();
