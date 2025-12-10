import { execSync } from "child_process";
import { PrismaClient } from "@/generated/prisma";
import "dotenv/config";

// Use a dedicated test database
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || "";

let prisma: PrismaClient;

export function getTestPrisma(): PrismaClient {
  if (!prisma) {
    process.env.DATABASE_URL = TEST_DATABASE_URL;
    prisma = new PrismaClient();
  }
  return prisma;
}

export async function setupTestDb() {
  process.env.DATABASE_URL = TEST_DATABASE_URL;

  try {
    execSync(`npx prisma migrate deploy`, {
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
      stdio: "ignore",
    });
  } catch (error) {
    console.error("Failed to run migrations on test database:", error);
    throw error;
  }
}

export async function clearTestDb() {
  const prisma = getTestPrisma();

  await prisma.activity.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
}

export async function teardownTestDb() {
  await prisma.$disconnect();
}
