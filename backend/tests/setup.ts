import { beforeAll, afterAll, afterEach } from "vitest";
import { setupTestDb, clearTestDb } from "./helpers/testDb";
import { server as mockServer } from "./mocks/strava.mock";
import "dotenv/config";

/**
 * Global configuration for all integration tests
 *
 * This file is automatically loaded by Vitest when TEST_TYPE=integration
 * See vitest.config.ts -> setupFiles
 */

// Verify test environment is correctely configured
if (!process.env.TEST_DATABASE_URL) {
  throw new Error(
    "TEST_DATABASE_URL must be defined in environment variables.\n" +
      "Make sure you have a .env file with TEST_DATABASE_URL configured."
  );
}

// Disable accidental execution on non-test database
if (process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) {
  throw new Error(
    "TEST_DATABASE_URL cannot be the same as DATABASE_URL!\n" +
      "You must use a separate database for tests to avoid data loss."
  );
}

/**
 * beforeAll - Executed before EACH test file
 * Setup test database and start mock servers
 */
beforeAll(async () => {
  console.info("🚀 Setting up test environment...");

  try {
    // Apply migrations on test database
    await setupTestDb();
    console.info("✅ Database migrations applied");

    // Clear any existing data from previous test runs
    await clearTestDb();
    console.info("✅ Database cleared");

    // Start MSW mock server to intercept Strava calls
    mockServer.listen({
      onUnhandledRequest: (req) => {
        const url = new URL(req.url);
        const isLocalhost =
          url.hostname === "127.0.0.1" || url.hostname === "localhost";

        if (!isLocalhost) {
          console.error(
            `[MSW] Unhandled external request: ${req.method} ${req.url}`
          );
          throw new Error(
            `Unexpected external request: ${req.method} ${req.url}`
          );
        }
      },
    });
    console.info("✅ Mock server started");
  } catch (error) {
    console.error("❌ Failed to setup test environment:", error);
    throw error;
  }
});

/**
 * afterEach - Executed after EACH test
 * Guarantee test isolation by cleaning database
 */
afterEach(async () => {
  try {
    // Clear all test data
    await clearTestDb();

    // Reset all mock servers handlers
    mockServer.resetHandlers();
  } catch (error) {
    console.error("❌ Failed to clean after test:", error);
    throw error;
  }
});

/**
 * afterAll - Executed after EACH test file
 * Clean resources and close connections
 */
afterAll(async () => {
  console.info("🧹 Tearing down test environment...");

  try {
    // Note: We don't deconnect Prisma here as other test files may still need it.
    // Node.js will automatically close the connection at the end of the process.
    console.info("✅ Database connection will be closed by Node.js");

    // Reset handlers but don't close the server (other test files may need it)
    mockServer.resetHandlers();
    console.info("✅ Mock server handlers reset");
  } catch (error) {
    console.error("❌ Failed to teardown test environment:", error);
    throw error;
  }
});
