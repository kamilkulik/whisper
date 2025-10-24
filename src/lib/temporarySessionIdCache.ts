import { v4 as uuidv4 } from "uuid";
import { prisma } from "./prisma";

export class TemporarySessionIdCache {
  private static instance: TemporarySessionIdCache;
  private instanceId: string;

  private constructor() {
    this.instanceId = uuidv4();
  }

  public static getInstance() {
    if (!TemporarySessionIdCache.instance) {
      TemporarySessionIdCache.instance = new TemporarySessionIdCache();
    }
    return TemporarySessionIdCache.instance;
  }

  public async set(
    sessionId: string,
    data: { confirmationCode: number; confirmationCodeExpires: Date }
  ) {
    if (!sessionId || !data.confirmationCode || !data.confirmationCodeExpires) {
      console.log(
        `TemporarySessionIdCache instanceId: ${this.instanceId} - Missing required data`,
        sessionId,
        data
      );
      return;
    }

    try {
      // Upsert the session data - this will create or update the existing session
      await prisma.sessionIdCache.upsert({
        where: { sessionId },
        update: {
          confirmationCode: data.confirmationCode,
          confirmationCodeExpires: data.confirmationCodeExpires,
        },
        create: {
          sessionId,
          confirmationCode: data.confirmationCode,
          confirmationCodeExpires: data.confirmationCodeExpires,
        },
      });

      console.log(
        `TemporarySessionIdCache instanceId: ${this.instanceId} - session data saved for sessionId: ${sessionId}`,
        await this.get(sessionId)
      );
    } catch (error) {
      console.error(
        `TemporarySessionIdCache instanceId: ${this.instanceId} - Error setting session data:`,
        error
      );
    }
  }

  public async get(
    sessionId: string
  ): Promise<
    { confirmationCode: number; confirmationCodeExpires: Date } | undefined
  > {
    try {
      const result = await prisma.sessionIdCache.findUnique({
        where: { sessionId },
      });

      console.log(
        `TemporarySessionIdCache instanceId: ${this.instanceId} - get`,
        sessionId,
        result
      );

      if (!result) {
        return undefined;
      }

      return {
        confirmationCode: result.confirmationCode,
        confirmationCodeExpires: result.confirmationCodeExpires || new Date(),
      };
    } catch (error) {
      console.error(
        `TemporarySessionIdCache instanceId: ${this.instanceId} - Error getting session data:`,
        error
      );
      return undefined;
    }
  }

  public async delete(sessionId: string) {
    try {
      await prisma.sessionIdCache.delete({
        where: { sessionId },
      });
      console.log(
        `TemporarySessionIdCache instanceId: ${this.instanceId} - deleted sessionId: ${sessionId}`
      );
    } catch (error) {
      console.error(
        `TemporarySessionIdCache instanceId: ${this.instanceId} - Error deleting session data:`,
        error
      );
    }
  }

  public async clear() {
    try {
      await prisma.sessionIdCache.deleteMany();
      console.log(
        `TemporarySessionIdCache instanceId: ${this.instanceId} - cleared all session data`
      );
    } catch (error) {
      console.error(
        `TemporarySessionIdCache instanceId: ${this.instanceId} - Error clearing session data:`,
        error
      );
    }
  }
}
