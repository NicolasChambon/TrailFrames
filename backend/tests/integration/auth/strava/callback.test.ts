import request from "supertest";
import {
  hashMockPasswords,
  mockStravaTokenResponse,
} from "tests/helpers/mockData";
import { getCsrfContext } from "tests/helpers/testCsrf";
import { getTestPrisma } from "tests/helpers/testDb";
import { getRegisteredUserContext } from "tests/helpers/testRegisterUser";
import { createTestApp } from "tests/helpers/testServer";
import { beforeEach, describe, expect, it } from "vitest";
import { decrypt } from "@/lib/encryption";

const app = createTestApp();
const prisma = getTestPrisma();

describe("Strava Authentication Integration Tests", () => {
  let csrfToken: string;
  let cookies: string[];
  let userId: string;
  let accessToken: string;

  beforeEach(async () => {
    // Get CSRF token for subsequent requests
    ({ csrfToken, cookies } = await getCsrfContext(app));

    await hashMockPasswords();

    // Register a user
    ({ userId, accessToken } = await getRegisteredUserContext(
      app,
      cookies,
      csrfToken
    ));
  });

  describe("POST /auth/strava/callback", () => {
    it("should authenticate with Strava successfully", async () => {
      const mockCode = "mock_authorization_code_12345";

      const response = await request(app)
        .post("/auth/strava/callback")
        .set("Cookie", [`accessToken=${accessToken}`, ...cookies])
        .set("X-CSRF-Token", csrfToken)
        .send({
          code: mockCode,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.stravaAthleteId).toBe(
        mockStravaTokenResponse.athlete.id
      );
      expect(response.body.user.username).toBe(
        mockStravaTokenResponse.athlete.username
      );

      // Verify user in database has Strava tokens (encrypted)
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      expect(user?.stravaAthleteId).toBe(
        BigInt(mockStravaTokenResponse.athlete.id)
      );
      expect(user?.stravaAccessToken).toBeDefined();
      expect(user?.stravaRefreshToken).toBeDefined();
      expect(user?.stravaTokenExpiresAt).toBeDefined();

      // Verify tokens are encrypted (should contain ":" separator)
      expect(user?.stravaAccessToken).toContain(":");
      expect(user?.stravaRefreshToken).toContain(":");

      // Verify we can decrypt them
      const decryptedAccessToken = decrypt(user!.stravaAccessToken!);
      expect(decryptedAccessToken).toBe(mockStravaTokenResponse.access_token);
    });

    it("should return 400 if code is missing", async () => {
      const response = await request(app)
        .post("/auth/strava/callback")
        .set("Cookie", [`accessToken=${accessToken}`, ...cookies])
        .set("X-CSRF-Token", csrfToken)
        .send({});

      expect(response.status).toBe(400);
    });

    it("should return 401 if user is not authenticated", async () => {
      const response = await request(app)
        .post("/auth/strava/callback")
        .set("Cookie", cookies)
        .set("X-CSRF-Token", csrfToken)
        .send({
          code: "some_code",
        });

      expect(response.status).toBe(401);
    });
  });
});
