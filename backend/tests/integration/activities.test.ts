import request from "supertest";
import {
  hashMockPasswords,
  mockStravaTokenResponse,
  mockUsers,
} from "@tests/helpers/mockData";
import { getCsrfContext } from "@tests/helpers/testCsrf";
import { getTestPrisma } from "@tests/helpers/testDb";
import { getRegisteredUserContext } from "@tests/helpers/testRegisterUser";
import { createTestApp } from "@tests/helpers/testServer";
import { beforeEach, describe, expect, it } from "vitest";
import { encrypt } from "@/lib/encryption";

const app = createTestApp();
const prisma = getTestPrisma();

describe("Activities API Integration Tests", () => {
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

    // Set Strava tokens for the user (simulate authenticated with Strava)
    await prisma.user.update({
      where: { id: userId },
      data: {
        stravaAthleteId: BigInt(mockStravaTokenResponse.athlete.id),
        stravaAccessToken: encrypt(mockStravaTokenResponse.access_token),
        stravaRefreshToken: encrypt(mockStravaTokenResponse.refresh_token),
        stravaTokenExpiresAt: new Date(
          mockStravaTokenResponse.expires_at * 1000
        ),
      },
    });
  });

  describe("PUT /activities", () => {
    it("should sync activities from Strava successfully", async () => {
      const response = await request(app)
        .put("/activities")
        .set("Cookie", [`accessToken=${accessToken}`, ...cookies])
        .set("X-CSRF-Token", csrfToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeGreaterThan(0);

      // Verify activities are in database
      const activities = await prisma.activity.findMany({
        where: { user: { id: userId } },
      });

      expect(activities.length).toBeGreaterThan(0);
      expect(activities[0].name).toBeDefined();
      expect(activities[0].distance).toBeDefined();
    });

    it("should return 401 if user is not authenticated", async () => {
      const response = await request(app)
        .put("/activities")
        .set("Cookie", [...cookies])
        .set("X-CSRF-Token", csrfToken);

      expect(response.status).toBe(401);
    });

    it("should return 400 if user has not connected Strava", async () => {
      // Create a user without Strava connection
      await prisma.user.create({
        data: {
          email: "noStrava@example.com",
          password: mockUsers.scarlet.hashedPassword,
        },
      });

      // Login as this user
      const loginResponse = await request(app)
        .post("/auth/login")
        .set("Cookie", cookies)
        .set("X-CSRF-Token", csrfToken)
        .send({
          email: "noStrava@example.com",
          password: mockUsers.scarlet.password,
        });

      const setCookies = loginResponse.headers["set-cookie"];
      const cookieArray = Array.isArray(setCookies) ? setCookies : [setCookies];
      const newAccessToken = cookieArray
        .find((cookie: string) => cookie.startsWith("accessToken="))
        ?.split(";")[0]
        .split("=")[1];

      const response = await request(app)
        .put("/activities")
        .set("Cookie", [`accessToken=${newAccessToken}`, ...cookies])
        .set("X-CSRF-Token", csrfToken);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Strava");
    });
  });
});
