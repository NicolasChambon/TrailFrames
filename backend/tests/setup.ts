import { beforeAll, afterAll, afterEach } from "vitest";
import { setupTestDb, clearTestDb, teardownTestDb } from "./helpers/testDb";
import { server as mockServer } from "./mocks/strava.mock";

// Setup global test database
beforeAll(async () => {
  await setupTestDb();
  mockServer.listen({ onUnhandledRequest: "error" });
});

// Clean database after each test
afterEach(async () => {
  await clearTestDb();
  mockServer.resetHandlers();
});

// Teardown
afterAll(async () => {
  await teardownTestDb();
  mockServer.close();
});
