import {
  mockStravaTokenResponse,
  mockUsers,
  seedTestUsers,
} from "@tests/helpers/mockData";
import { getCsrfContext } from "@tests/helpers/testCsrf";
import { loginUser } from "@tests/helpers/testRegisterUser";
import { createTestApp } from "@tests/helpers/testServer";
import { Application } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { decrypt } from "@/lib/encryption";
import { prisma } from "@/lib/prisma";

describe("Strava Authentication Integration Tests", () => {
  let app: Application;
  let csrfToken: string;
  let cookies: string[];
  let userId: string;

  beforeEach(async () => {
    app = createTestApp();

    // Create test users in database
    const users = await seedTestUsers();
    userId = users.bobby.id;

    // Get CSRF token and initial cookies
    ({ csrfToken, cookies } = await getCsrfContext(app));

    // Login to get authentication cookies
    const loginContext = await loginUser(
      app,
      cookies,
      csrfToken,
      mockUsers.bobby.email,
      mockUsers.bobby.password
    );
    cookies = loginContext.cookies;
  });

  describe("GET /auth/strava/callback", () => {
    it("should authenticate with Strava successfully", async () => {
      const mockCode = "mock_authorization_code_12345";

      const response = await request(app)
        .get(`/auth/strava/callback?code=${mockCode}`)
        .set("Cookie", cookies)
        .set("X-CSRF-Token", csrfToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.trailFramesUserId).toBeDefined();
      expect(response.body.message).toBe("Strava authentication successful");

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
        .get("/auth/strava/callback")
        .set("Cookie", cookies)
        .set("X-CSRF-Token", csrfToken);

      expect(response.status).toBe(400);
    });

    it("should return 401 if user is not authenticated", async () => {
      // Get only CSRF cookies without auth tokens
      const { cookies: csrfOnlyCookies, csrfToken: freshCsrfToken } =
        await getCsrfContext(app);

      const response = await request(app)
        .get("/auth/strava/callback?code=some_code")
        .set("Cookie", csrfOnlyCookies)
        .set("X-CSRF-Token", freshCsrfToken);

      expect(response.status).toBe(401);
    });
  });
});
