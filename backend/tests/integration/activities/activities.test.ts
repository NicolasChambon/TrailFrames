import { mockStravaActivities, seedTestUsers } from "@tests/helpers/mockData";
import { getCsrfContext } from "@tests/helpers/testCsrf";
import { loginUser } from "@tests/helpers/testRegisterUser";
import { createTestApp } from "@tests/helpers/testServer";
import { Application } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";

describe("Activities Sync Integration Tests", () => {
  describe("PUT /activities", () => {
    let app: Application;
    let csrfToken: string;
    let cookies: string[];
    let userId: string;

    beforeEach(async () => {
      // Wait a bit to avoid race conditions and CSRF rate limits
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Create app
      app = createTestApp();

      // Seed test users
      const { bobby } = await seedTestUsers();
      userId = bobby.id;

      // Get CSRF token and initial cookies
      const csrfContext = await getCsrfContext(app);
      csrfToken = csrfContext.csrfToken;

      // Login user to get authentication cookies
      const loginContext = await loginUser(
        app,
        csrfContext.cookies,
        csrfToken
      );
      cookies = loginContext.cookies;

      console.log("🔐 Cookies before Strava callback:", cookies);

      // Authenticate user with Strava
      const mockCode = "mock_authorization_code_12345";
      const callbackResponse = await request(app)
        .get(`/auth/strava/callback?code=${mockCode}`)
        .set("Cookie", cookies)
        .set("X-CSRF-Token", csrfToken);

      console.log("🔗 Strava callback response:", {
        status: callbackResponse.status,
        body: callbackResponse.body,
      });

      // Update cookies if the callback returned new ones
      if (callbackResponse.headers["set-cookie"]) {
        const newCookies = Array.isArray(
          callbackResponse.headers["set-cookie"]
        )
          ? callbackResponse.headers["set-cookie"]
          : [callbackResponse.headers["set-cookie"]];
        console.log("🍪 New cookies from callback:", newCookies);
      }
    });

    it("should sync activities successfully", async () => {
      console.log("📤 Syncing activities with cookies:", cookies);
      const response = await request(app)
        .put("/activities")
        .set("Cookie", cookies)
        .set("X-CSRF-Token", csrfToken);

      console.log("📥 Sync response:", {
        status: response.status,
        body: response.body,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify activities were saved in database
      const activities = await prisma.activity.findMany({
        where: { trailFramesUserId: userId },
      });

      expect(activities.length).toBe(mockStravaActivities.length);

      // Verify first activity details
      const firstActivity = activities.find(
        (a) => a.stravaActivityId === BigInt(mockStravaActivities[0].id)
      );

      expect(firstActivity).toBeDefined();
      expect(firstActivity?.name).toBe(mockStravaActivities[0].name);
      expect(firstActivity?.sportType).toBe(mockStravaActivities[0].sport_type);
      expect(firstActivity?.distance).toBe(mockStravaActivities[0].distance);
    });

    it("should return 401 if user is not authenticated", async () => {
      // Get only CSRF cookies without auth tokens
      const { cookies: csrfOnlyCookies, csrfToken: freshCsrfToken } =
        await getCsrfContext(app);

      const response = await request(app)
        .put("/activities")
        .set("Cookie", csrfOnlyCookies)
        .set("X-CSRF-Token", freshCsrfToken);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should return 401 if user has no Strava tokens", async () => {
      // Get fresh CSRF context for scarlet
      const { cookies: csrfCookies, csrfToken: freshCsrfToken } =
        await getCsrfContext(app);

      // Login as scarlet (already seeded in beforeEach)
      const { cookies: scarletCookies } = await loginUser(
        app,
        csrfCookies,
        freshCsrfToken,
        "scarlet@example.com",
        "AnotherPass456!"
      );

      // Try to sync activities without Strava auth
      const response = await request(app)
        .put("/activities")
        .set("Cookie", scarletCookies)
        .set("X-CSRF-Token", freshCsrfToken);

      expect(response.status).toBe(401);
    });

    it("should not create duplicate activities on multiple syncs", async () => {
      // First sync
      await request(app)
        .put("/activities")
        .set("Cookie", cookies)
        .set("X-CSRF-Token", csrfToken);

      // Second sync
      await request(app)
        .put("/activities")
        .set("Cookie", cookies)
        .set("X-CSRF-Token", csrfToken);

      // Verify no duplicates
      const activities = await prisma.activity.findMany({
        where: { trailFramesUserId: userId },
      });

      expect(activities.length).toBe(mockStravaActivities.length);
    });
  });
});
