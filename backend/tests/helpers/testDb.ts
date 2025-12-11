import { execSync } from "child_process";
import { prisma } from "@/lib/prisma";
import "dotenv/config";

// Use a dedicated test database
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || "";

if (!TEST_DATABASE_URL) {
  throw new Error("TEST_DATABASE_URL must be defined in environment variables");
}

/**
 * Execute Prisma migrations on the test database
 * Called once before all tests (in beforeAll)
 */
export async function setupTestDb() {
  try {
    // Disconnect Prisma before running migrations to avoid connection conflicts
    await prisma.$disconnect();

    execSync(`npx prisma migrate deploy`, {
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
      stdio: "ignore",
    });

    // Reconnect after migrations
    await prisma.$connect();
  } catch (error) {
    console.error("Failed to run migrations on test database:", error);
    throw error;
  }
}

/**
 * Clean all test data
 * Called before each test (in afterEach) to ensure test isolation
 * IMPORTANT: Removing order respects foreign key constraints
 */
export async function clearTestDb() {
  try {
    await prisma.activity.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
  } catch (error) {
    console.error("Error clearing test database:", error);
    throw error;
  }
}

/**
 * Close properly the Prisma connection
 * Called once after all tests (in afterAll)
 */
export async function teardownTestDb() {
  await prisma.$disconnect();
}
