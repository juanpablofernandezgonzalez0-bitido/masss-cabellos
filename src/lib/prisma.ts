import { PrismaClient } from "@/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as { __prisma: PrismaClient };

function getClient() {
  if (!globalForPrisma.__prisma) {
    const connectionString = process.env.DATABASE_URL!.replace('-pooler', '');
    const adapter = new PrismaNeon({ connectionString });
    globalForPrisma.__prisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.__prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const client = getClient();
    return (client as unknown as Record<string | symbol, unknown>)[prop];
  },
});
