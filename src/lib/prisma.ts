import "server-only";

import { PrismaClient, Subscription, SubscriptionStatus } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function getUserFromEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function getUserFromPhone(phone: string) {
  return prisma.user.findUnique({
    where: { phoneNumber: phone },
  });
}

export async function getUserFromSessionId(sessionId: string) {
  return prisma.user.findUnique({
    where: { sessionId },
  });
}

export async function getLatestSubscriptionFromUserId(
  userId: number
): Promise<Subscription[] | []> {
  return prisma.subscription.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
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
): Promise<Subscription | null> {
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
  });
}
