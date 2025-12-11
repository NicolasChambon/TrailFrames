import {
  mockStravaTokenResponse,
  mockUsers,
  seedTestUsers,
} from "@tests/helpers/mockData";
import { getCsrfContext } from "@tests/helpers/testCsrf";
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
  let accessToken: string;

  beforeEach(async () => {
    app = createTestApp();

    // Create test users in database
    const users = await seedTestUsers();
    userId = users.bobby.id;

    // Get CSRF token for subsequent requests
    ({ csrfToken, cookies } = await getCsrfContext(app));

    // Login to get access token
    const loginResponse = await request(app)
      .post("/auth/login")
      .set("Cookie", cookies)
      .set("X-CSRF-Token", csrfToken)
      .send({
        email: mockUsers.bobby.email,
        password: mockUsers.bobby.password,
      });

    const setCookies = loginResponse.headers["set-cookie"];
    const cookieArray = Array.isArray(setCookies) ? setCookies : [setCookies];

    const accessCookie = cookieArray.find((cookie: string) =>
      cookie.startsWith("access_token=")
    );

    accessToken = accessCookie.split(";")[0].split("=")[1];
  });

  describe("GET /auth/strava/callback", () => {
    it("should authenticate with Strava successfully", async () => {
      const mockCode = "mock_authorization_code_12345";

      const response = await request(app)
        .get(`/auth/strava/callback?code=${mockCode}`)
        .set("Cookie", [`access_token=${accessToken}`, ...cookies]);

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
        .set("Cookie", [`access_token=${accessToken}`, ...cookies]);

      expect(response.status).toBe(400);
    });

    it("should return 401 if user is not authenticated", async () => {
      const response = await request(app)
        .get("/auth/strava/callback?code=some_code")
        .set("Cookie", cookies);

      expect(response.status).toBe(401);
    });
  });
});
