import { mockUsers, seedTestUsers } from "@tests/helpers/mockData";
import { getCsrfContext } from "@tests/helpers/testCsrf";
import { loginUser } from "@tests/helpers/testRegisterUser";
import { createTestApp } from "@tests/helpers/testServer";
import { Application } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

describe("GET /auth/current-user", () => {
  let app: Application;
  let csrfToken: string;
  let cookies: string[];
  let authenticatedCookies: string[];
  let userId: string;

  beforeEach(async () => {
    // Create app
    app = createTestApp();

    // Seed test users
    await seedTestUsers();

    // Get CSRF token
    ({ csrfToken, cookies } = await getCsrfContext(app));

    // Login to get authentication cookies
    const loginContext = await loginUser(app, cookies, csrfToken);
    authenticatedCookies = loginContext.cookies;
    userId = loginContext.userId;
  });

  it("should return current user when authenticated", async () => {
    const response = await request(app)
      .get("/auth/current-user")
      .set("Cookie", authenticatedCookies);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.id).toBe(userId);
    expect(response.body.user.email).toBe(mockUsers.bobby.email);
    expect(response.body.user.password).toBeUndefined(); // Password should not be returned
  });

  it("should return 401 when not authenticated (no token)", async () => {
    const response = await request(app).get("/auth/current-user");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
