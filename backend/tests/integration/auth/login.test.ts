import { mockUsers, seedTestUsers } from "@tests/helpers/mockData";
import { getCsrfContext } from "@tests/helpers/testCsrf";
import { createTestApp } from "@tests/helpers/testServer";
import { Application } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

describe("User Login Integration Tests", () => {
  let app: Application;
  let csrfToken: string;
  let cookies: string[];

  // Create app once for all the tests suite
  // This garantees CSRF secret coherence
  beforeEach(async () => {
    app = createTestApp();

    // Create test users in database
    await seedTestUsers();

    // Get CSRF token for subsequent requests
    ({ csrfToken, cookies } = await getCsrfContext(app));
  });

  describe("POST /auth/login", () => {
    it("should login successfully with valid credentials", async () => {
      const response = await request(app)
        .post("/auth/login")
        .set("Cookie", cookies)
        .set("X-CSRF-Token", csrfToken)
        .send({
          email: mockUsers.bobby.email,
          password: mockUsers.bobby.password,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(mockUsers.bobby.email);

      // Check cookies are set
      const setCookies = response.headers["set-cookie"];
      expect(setCookies).toBeDefined();

      const cookieArray = Array.isArray(setCookies) ? setCookies : [setCookies];

      expect(
        cookieArray.some((cookie: string) => cookie.startsWith("access_token="))
      ).toBe(true);
      expect(
        cookieArray.some((cookie: string) =>
          cookie.startsWith("refresh_token=")
        )
      ).toBe(true);
    });

    it("should return 401 with invalid password", async () => {
      const response = await request(app)
        .post("/auth/login")
        .set("Cookie", cookies)
        .set("X-CSRF-Token", csrfToken)
        .send({
          email: mockUsers.bobby.email,
          password: "WrongPassword123!",
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Invalid email or password");
    });

    it("should return 401 if user does not exist", async () => {
      const response = await request(app)
        .post("/auth/login")
        .set("Cookie", cookies)
        .set("X-CSRF-Token", csrfToken)
        .send({
          email: "nonexistent@example.com",
          password: mockUsers.bobby.password,
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Invalid email or password");
    });

    it("should return 403 without CSRF token", async () => {
      const response = await request(app)
        .post("/auth/login")
        .set("Cookie", cookies)
        .send({
          email: mockUsers.bobby.email,
          password: mockUsers.bobby.password,
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain("Invalid CSRF token.");
    });

    it("should return 403 with invalid CSRF token", async () => {
      const response = await request(app)
        .post("/auth/login")
        .set("Cookie", cookies)
        .set("X-CSRF-Token", "invalid-token-123")
        .send({
          email: mockUsers.bobby.email,
          password: mockUsers.bobby.password,
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain("Invalid CSRF token.");
    });
  });
});
