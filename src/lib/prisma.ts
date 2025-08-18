import "server-only";

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export function getUserFromEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export function getUserFromPhone(phone: string) {
  return prisma.user.findUnique({
    where: { phoneNumber: phone },
  });
}

export function getUserFromSessionId(sessionId: string) {
  return prisma.user.findUnique({
    where: { sessionId },
  });
}
