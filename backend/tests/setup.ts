import { beforeAll, afterAll, afterEach } from "vitest";
import { setupTestDb, clearTestDb, teardownTestDb } from "./helpers/testDb";
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
 * beforeAll - Executed ONCE before all tests
 * Setup test database and start mock servers
 */
beforeAll(async () => {
  console.info("🚀 Setting up test environment...");

  try {
    // Apply migrations on test database
    await setupTestDb();
    console.info("✅ Database migrations applied");

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
 * afterAll - Executed ONCE after all tests
 * Clean resources and close connections
 */
afterAll(async () => {
  console.info("🧹 Tearing down test environment...");

  try {
    // Close Frisma connection
    await teardownTestDb();
    console.info("✅ Database connection closed");

    // Stop mock server
    mockServer.close();
    console.info("✅ Mock server stopped");
  } catch (error) {
    console.error("❌ Failed to teardown test environment:", error);
    throw error;
  }
});
