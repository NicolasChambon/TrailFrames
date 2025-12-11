import { seedTestUsers } from "@tests/helpers/mockData";
import { getCsrfContext } from "@tests/helpers/testCsrf";
import { createTestApp } from "@tests/helpers/testServer";
import { Application } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";

describe("Refresh Token Integration Tests", () => {
  describe("POST /auth/refresh", () => {
    let app: Application;
    let csrfToken: string;
    let cookies: string[];
    let refreshToken: string;

    beforeEach(async () => {
      // Create app
      app = createTestApp();

      // Seed test users
      await seedTestUsers();

      // Get CSRF token
      ({ csrfToken, cookies } = await getCsrfContext(app));

      // Login to get refresh token
      const loginResponse = await request(app)
        .post("/auth/login")
        .set("Cookie", cookies)
        .set("X-CSRF-Token", csrfToken)
        .send({
          email: "bobby@example.com",
          password: "SecurePass123!",
        });

      // Extract refresh token from cookies
      const setCookies = Array.isArray(loginResponse.headers["set-cookie"])
        ? loginResponse.headers["set-cookie"]
        : [loginResponse.headers["set-cookie"]];

      const refreshCookie = setCookies.find((cookie: string | undefined) =>
        cookie?.startsWith("refresh_token=")
      );

      refreshToken = refreshCookie!.split(";")[0].split("=")[1];
    });

    it("should refresh tokens successfully", async () => {
      // Verify old token exists before refresh
      const tokenBeforeRefresh = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });
      expect(tokenBeforeRefresh).not.toBeNull();

      // Wait 1 second to ensure new token has different iat
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await request(app)
        .post("/auth/refresh")
        .set("Cookie", [`refresh_token=${refreshToken}`, ...cookies])
        .set("X-CSRF-Token", csrfToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Tokens refreshed successfully");

      // Verify new cookies are set
      const setCookies = Array.isArray(response.headers["set-cookie"])
        ? response.headers["set-cookie"]
        : [response.headers["set-cookie"]];
      expect(
        setCookies.some((cookie: string) => cookie.startsWith("access_token="))
      ).toBe(true);
      expect(
        setCookies.some((cookie: string) => cookie.startsWith("refresh_token="))
      ).toBe(true);

      // Verify old refresh token no longer exists in database (was deleted)
      const oldToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      expect(oldToken).toBeNull();

      // Verify new refresh token was created
      const allTokens = await prisma.refreshToken.findMany({
        where: { userId: tokenBeforeRefresh!.userId },
      });

      expect(allTokens.length).toBe(1);
      expect(allTokens[0].token).not.toBe(refreshToken);
    });

    it("should return 400 without refresh token", async () => {
      const response = await request(app)
        .post("/auth/refresh")
        .set("Cookie", cookies)
        .set("X-CSRF-Token", csrfToken);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 401 with invalid refresh token", async () => {
      const response = await request(app)
        .post("/auth/refresh")
        .set("Cookie", [`refresh_token=invalid-token-12345`, ...cookies])
        .set("X-CSRF-Token", csrfToken);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should return 401 when trying to reuse a refresh token", async () => {
      // Wait to ensure different iat
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // First refresh - should succeed
      const firstRefresh = await request(app)
        .post("/auth/refresh")
        .set("Cookie", [`refresh_token=${refreshToken}`, ...cookies])
        .set("X-CSRF-Token", csrfToken);

      expect(firstRefresh.status).toBe(200);

      // Second refresh with same token - should fail
      const secondRefresh = await request(app)
        .post("/auth/refresh")
        .set("Cookie", [`refresh_token=${refreshToken}`, ...cookies])
        .set("X-CSRF-Token", csrfToken);

      expect(secondRefresh.status).toBe(401);
      expect(secondRefresh.body.success).toBe(false);
    });
  });
});
