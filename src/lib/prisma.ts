import "server-only";

import {
  PrismaClient,
  Subscription,
  SubscriptionStatus,
  User,
} from "@prisma/client";

import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";

import ws from "ws";

neonConfig.webSocketConstructor = ws;

// To work in edge environments (Cloudflare Workers, Vercel Edge, etc.), enable querying over fetch
neonConfig.poolQueryViaFetch = true;

// Type definitions
declare global {
  var prisma: PrismaClient | undefined;
}

const connectionString = `${process.env.DATABASE_URL}`;

// https://www.prisma.io/docs/orm/overview/databases/neon#how-to-use-neons-serverless-driver-with-prisma-orm
const adapter = new PrismaNeon({ connectionString });
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.VERCEL_ENV !== "production") globalForPrisma.prisma = prisma;

export async function getUserFromEmail(
  email: string
): Promise<Pick<User, "id"> | null> {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
    },
  });
}

export async function getUserFromSessionId<T extends keyof User>(
  sessionId: string,
  selectFields?: Record<T, boolean>
): Promise<Pick<User, T> | null> {
  return prisma.user.findUnique({
    where: { sessionId },
    select: selectFields ?? undefined,
  });
}

// type, id, subscriptionId
export async function getLatestSubscriptionFromUserId(
  userId: number
): Promise<Pick<Subscription, "id" | "subscriptionId" | "type">[] | []> {
  return prisma.subscription.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      subscriptionId: true,
      type: true,
    },
  });
}

export async function deleteSession(sessionId: string) {
  return prisma.user.update({
    where: { sessionId },
    data: { sessionId: null },
  });
}

export async function getLatestActiveSubscriptionForUserEmail(
  email: string
): Promise<Pick<Subscription, "id" | "type"> | null> {
  const user = await getUserFromEmail(email);
  if (!user) {
    return null;
  }
  return prisma.subscription.findFirst({
    where: {
      userId: user.id,
      status: SubscriptionStatus.ACTIVE,
      dateExpires: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      type: true,
    },
  });
}
