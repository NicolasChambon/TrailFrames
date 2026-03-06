import { mockStravaActivities, seedTestUsers } from "@tests/helpers/mockData";
import { getCsrfContext } from "@tests/helpers/testCsrf";
import { loginUser } from "@tests/helpers/testRegisterUser";
import { createTestApp } from "@tests/helpers/testServer";
import { Application } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";

// Parse SSE text body into an array of typed event objects
function parseSseEvents(text: string): Array<Record<string, unknown>> {
  return text
    .split("\n\n")
    .filter((chunk) => chunk.startsWith("data: "))
    .map((chunk) => JSON.parse(chunk.replace(/^data: /, "").trim()));
}

describe("Activities Sync Integration Tests", () => {
  describe("GET /activities/sync/stream", () => {
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
      const loginContext = await loginUser(app, csrfContext.cookies, csrfToken);
      cookies = loginContext.cookies;

      // Authenticate user with Strava (stores encrypted tokens in DB)
      const mockCode = "mock_authorization_code_12345";
      await request(app)
        .get(`/auth/strava/callback?code=${mockCode}`)
        .set("Cookie", cookies)
        .set("X-CSRF-Token", csrfToken);
    });

    it("should return 401 if user is not authenticated", async () => {
      const { cookies: csrfOnlyCookies, csrfToken: freshCsrfToken } =
        await getCsrfContext(app);

      const response = await request(app)
        .get(`/activities/sync/stream?csrfToken=${freshCsrfToken}`)
        .set("Cookie", csrfOnlyCookies);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should stream SSE events and save activities in DB", async () => {
      const response = await request(app)
        .get(`/activities/sync/stream?csrfToken=${csrfToken}`)
        .set("Cookie", cookies)
        .buffer(true)
        .parse((res, callback) => {
          let data = "";
          res.on("data", (chunk: Buffer) => (data += chunk.toString()));
          res.on("end", () => callback(null, data));
        });

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toMatch(/text\/event-stream/);

      const events = parseSseEvents(response.body as string);

      // Verify expected SSE event sequence
      expect(events[0].type).toBe("started");
      expect(events[1].type).toBe("fetching_page");
      expect(events[2].type).toBe("saving_activities");

      const completedEvent = events.find((e) => e.type === "completed");
      expect(completedEvent).toBeDefined();
      expect(completedEvent?.totalSynced).toBe(mockStravaActivities.length);

      // Verify activities were saved in DB
      const activities = await prisma.activity.findMany({
        where: { trailFramesUserId: userId },
      });
      expect(activities.length).toBe(mockStravaActivities.length);

      // Verify first activity fields
      const firstActivity = activities.find(
        (a) => a.stravaActivityId === BigInt(mockStravaActivities[0].id),
      );
      expect(firstActivity).toBeDefined();
      expect(firstActivity?.name).toBe(mockStravaActivities[0].name);
      expect(firstActivity?.sportType).toBe(mockStravaActivities[0].sport_type);
      expect(firstActivity?.distance).toBe(mockStravaActivities[0].distance);

      // Verify lastSyncedAt was updated
      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
      });
      expect(updatedUser?.lastSyncedAt).not.toBeNull();
    });

    it("should stream an error event if user has no Strava token", async () => {
      // Get fresh CSRF context and login as scarlet (never connected to Strava)
      const { cookies: csrfCookies, csrfToken: freshCsrfToken } =
        await getCsrfContext(app);
      const { cookies: scarletCookies } = await loginUser(
        app,
        csrfCookies,
        freshCsrfToken,
        "scarlet@example.com",
        "AnotherPass456!",
      );

      const response = await request(app)
        .get(`/activities/sync/stream?csrfToken=${freshCsrfToken}`)
        .set("Cookie", scarletCookies)
        .buffer(true)
        .parse((res, callback) => {
          let data = "";
          res.on("data", (chunk: Buffer) => (data += chunk.toString()));
          res.on("end", () => callback(null, data));
        });

      expect(response.status).toBe(200);

      const events = parseSseEvents(response.body as string);
      const errorEvent = events.find((e) => e.type === "error");

      expect(errorEvent).toBeDefined();
      expect(typeof errorEvent?.message).toBe("string");
    });

    it("should stream an error event if activities are already synced", async () => {
      // First sync (succeeds)
      await request(app)
        .get(`/activities/sync/stream?csrfToken=${csrfToken}`)
        .set("Cookie", cookies)
        .buffer(true)
        .parse((res, callback) => {
          let data = "";
          res.on("data", (chunk: Buffer) => (data += chunk.toString()));
          res.on("end", () => callback(null, data));
        });

      // Second sync attempt (should fail because lastSyncedAt is now set)
      const response = await request(app)
        .get(`/activities/sync/stream?csrfToken=${csrfToken}`)
        .set("Cookie", cookies)
        .buffer(true)
        .parse((res, callback) => {
          let data = "";
          res.on("data", (chunk: Buffer) => (data += chunk.toString()));
          res.on("end", () => callback(null, data));
        });

      expect(response.status).toBe(200);

      const events = parseSseEvents(response.body as string);
      const errorEvent = events.find((e) => e.type === "error");

      expect(errorEvent).toBeDefined();
    });
  });
});
