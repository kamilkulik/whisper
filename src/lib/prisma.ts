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

// Type definitions
declare global {
  var prisma: PrismaClient | undefined;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Conditional Prisma client setup based on environment
let prisma: PrismaClient;

if (process.env.VERCEL_ENV === "production") {
  // Use Neon adapter for Vercel production
  neonConfig.webSocketConstructor = ws;
  // To work in edge environments (Cloudflare Workers, Vercel Edge, etc.), enable querying over fetch
  neonConfig.poolQueryViaFetch = true;

  const connectionString = `${process.env.DATABASE_URL}`;
  const adapter = new PrismaNeon({ connectionString });
  prisma = globalForPrisma.prisma || new PrismaClient({ adapter });
} else if (process.env.NODE_ENV === "development") {
  // Use standard Prisma client for development
  prisma = globalForPrisma.prisma || new PrismaClient();
} else {
  // Fallback to standard Prisma client for other environments
  prisma = globalForPrisma.prisma || new PrismaClient();
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { prisma };

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

export async function getUserFromPhoneNumber(
  phoneNumber: string
): Promise<Pick<User, "id"> | null> {
  return prisma.user.findUnique({
    where: { phoneNumber },
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

export async function getUsersLatestActiveSubscription(
  email?: string,
  phoneNumber?: string,
  userId?: number
): Promise<Pick<Subscription, "id" | "type"> | null> {
  let user;

  if (userId) {
    user = userId;
  } else if (email) {
    user = (await getUserFromEmail(email))?.id;
  } else if (phoneNumber) {
    user = (await getUserFromPhoneNumber(phoneNumber))?.id;
  }

  if (!user) {
    return null;
  }

  return prisma.subscription.findFirst({
    where: {
      userId: user,
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
