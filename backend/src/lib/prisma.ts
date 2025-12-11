import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";
import { PrismaClient } from "@/generated/prisma/index.js";

// Detect if we are in a test environment
const isTestEnvironment =
  process.env.NODE_ENV === "test" || process.env.TEST_TYPE === "integration";

// Use right database connection URL based on environment
const connectionString = isTestEnvironment
  ? process.env.TEST_DATABASE_URL
  : process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    `Missing database configuration: ${
      isTestEnvironment ? "TEST_DATABASE_URL" : "DATABASE_URL"
    }`
  );
}

// Create pool and adapter
const pgPool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pgPool);

// Instance Prisma singleton
let prismaInstance: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      adapter,
      log: isTestEnvironment ? [] : ["error", "warn"],
    });
  }
  return prismaInstance;
}

// Export default instance
export const prisma = getPrismaClient();

// To close properly the connection (used in tests)
export async function disconnectPrisma() {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
}
