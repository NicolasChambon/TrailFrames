import { mockStravaActivities, seedTestUsers } from "@tests/helpers/mockData";
import { getCsrfContext } from "@tests/helpers/testCsrf";
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
    let accessToken: string;
    let userId: string;

    beforeEach(async () => {
      // Wait a bit to avoid race conditions and CSRF rate limits
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Create app
      app = createTestApp();

      // Seed test users
      const { bobby } = await seedTestUsers();
      userId = bobby.id;

      // Get CSRF token
      ({ csrfToken, cookies } = await getCsrfContext(app));

      // Create access token manually for bobby (to avoid rate limit)
      const jwt = (await import("jsonwebtoken")).default;
      accessToken = jwt.sign(
        { userId: bobby.id, email: bobby.email },
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: "15m" }
      );

      // Authenticate user with Strava
      const mockCode = "mock_authorization_code_12345";
      await request(app)
        .get(`/auth/strava/callback?code=${mockCode}`)
        .set("Cookie", [`access_token=${accessToken}`, ...cookies]);
    });

    it("should sync activities successfully", async () => {
      const response = await request(app)
        .put("/activities")
        .set("Cookie", [`access_token=${accessToken}`, ...cookies])
        .set("X-CSRF-Token", csrfToken);

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
      const response = await request(app)
        .put("/activities")
        .set("Cookie", cookies)
        .set("X-CSRF-Token", csrfToken);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should return 401 if user has no Strava tokens", async () => {
      // Login as scarlet (already seeded in beforeEach)
      const loginResponse = await request(app)
        .post("/auth/login")
        .set("Cookie", cookies)
        .set("X-CSRF-Token", csrfToken)
        .send({
          email: "scarlet@example.com",
          password: "AnotherPass456!",
        });

      const setCookies = Array.isArray(loginResponse.headers["set-cookie"])
        ? loginResponse.headers["set-cookie"]
        : [loginResponse.headers["set-cookie"]];

      const scarletAccessCookie = setCookies.find(
        (cookie: string | undefined) => cookie?.startsWith("access_token=")
      );

      const scarletAccessToken = scarletAccessCookie!
        .split(";")[0]
        .split("=")[1];

      // Try to sync activities without Strava auth
      const response = await request(app)
        .put("/activities")
        .set("Cookie", [`access_token=${scarletAccessToken}`, ...cookies])
        .set("X-CSRF-Token", csrfToken);

      expect(response.status).toBe(401);
    });

    it("should not create duplicate activities on multiple syncs", async () => {
      // First sync
      await request(app)
        .put("/activities")
        .set("Cookie", [`access_token=${accessToken}`, ...cookies])
        .set("X-CSRF-Token", csrfToken);

      // Second sync
      await request(app)
        .put("/activities")
        .set("Cookie", [`access_token=${accessToken}`, ...cookies])
        .set("X-CSRF-Token", csrfToken);

      // Verify no duplicates
      const activities = await prisma.activity.findMany({
        where: { trailFramesUserId: userId },
      });

      expect(activities.length).toBe(mockStravaActivities.length);
    });
  });
});
