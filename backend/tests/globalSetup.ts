import "dotenv/config";
import { setupTestDb } from "./helpers/testDb";

/**
 * Global setup - executed ONCE before all test files
 *
 * DB migrations are run here to avoid:
 * 1. Redundant migrations (7 calls instead of 1)
 * 2. Timeouts on the first call in CI when the DB is cold
 *
 * See vitest.config.ts -> globalSetup
 */
export async function setup() {
  if (process.env.TEST_TYPE !== "integration") return;

  if (!process.env.TEST_DATABASE_URL) {
    throw new Error(
      "TEST_DATABASE_URL must be defined in environment variables."
    );
  }

  if (process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) {
    throw new Error(
      "TEST_DATABASE_URL cannot be the same as DATABASE_URL!\n" +
        "You must use a separate database for tests to avoid data loss."
    );
  }

  await setupTestDb();
}
