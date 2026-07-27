import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient();
}

function hasTimelineDelegate(client: PrismaClient | undefined) {
  return Boolean(client && "timelineEvent" in (client as PrismaClient & Record<string, unknown>));
}

export const prisma =
  hasTimelineDelegate(globalForPrisma.prisma)
    ? globalForPrisma.prisma!
    : createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}