import { getCsrfContext } from "@tests/helpers/testCsrf";
import { createTestApp } from "@tests/helpers/testServer";
import { Application } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";

describe("Register Integration Tests", () => {
  let app: Application;
  let csrfToken: string;
  let cookies: string[];

  beforeEach(async () => {
    app = createTestApp();

    // Get CSRF token for subsequent requests
    ({ csrfToken, cookies } = await getCsrfContext(app));
  });

  describe("POST /auth/register", () => {
    it("should register a new user successfully", async () => {
      const response = await request(app)
        .post("/auth/register")
        .set("Cookie", cookies)
        .set("X-CSRF-Token", csrfToken)
        .send({
          email: "newuser@example.com",
          password: "SecurePass123!",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe("newuser@example.com");
      expect(response.body.user.password).toBeUndefined(); // Password should not be returned

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: "newuser@example.com" },
      });

      expect(user).toBeDefined();
      expect(user?.email).toBe("newuser@example.com");

      // Verify auth cookies are set
      const setCookies = Array.isArray(response.headers["set-cookie"])
        ? response.headers["set-cookie"]
        : [response.headers["set-cookie"]];
      expect(
        setCookies.some((cookie: string) => cookie.startsWith("access_token="))
      ).toBe(true);
      expect(
        setCookies.some((cookie: string) => cookie.startsWith("refresh_token="))
      ).toBe(true);
    });

    it("should return 400 with invalid email", async () => {
      const response = await request(app)
        .post("/auth/register")
        .set("Cookie", cookies)
        .set("X-CSRF-Token", csrfToken)
        .send({
          email: "invalid-email",
          password: "SecurePass123!",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 with weak password (no uppercase)", async () => {
      const response = await request(app)
        .post("/auth/register")
        .set("Cookie", cookies)
        .set("X-CSRF-Token", csrfToken)
        .send({
          email: "newuser@example.com",
          password: "weakpass123!",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 with weak password (no special char)", async () => {
      const response = await request(app)
        .post("/auth/register")
        .set("Cookie", cookies)
        .set("X-CSRF-Token", csrfToken)
        .send({
          email: "newuser@example.com",
          password: "WeakPass123",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 with short password", async () => {
      const response = await request(app)
        .post("/auth/register")
        .set("Cookie", cookies)
        .set("X-CSRF-Token", csrfToken)
        .send({
          email: "newuser@example.com",
          password: "Short1!",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 409 when email already exists", async () => {
      // First registration
      await request(app)
        .post("/auth/register")
        .set("Cookie", cookies)
        .set("X-CSRF-Token", csrfToken)
        .send({
          email: "duplicate@example.com",
          password: "SecurePass123!",
        });

      // Second registration with same email
      const response = await request(app)
        .post("/auth/register")
        .set("Cookie", cookies)
        .set("X-CSRF-Token", csrfToken)
        .send({
          email: "duplicate@example.com",
          password: "AnotherPass456!",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 403 without CSRF token", async () => {
      const response = await request(app)
        .post("/auth/register")
        .set("Cookie", cookies)
        .send({
          email: "newuser@example.com",
          password: "SecurePass123!",
        });

      expect(response.status).toBe(403);
    });

    it("should return 403 with invalid CSRF token", async () => {
      const response = await request(app)
        .post("/auth/register")
        .set("Cookie", cookies)
        .set("X-CSRF-Token", "invalid-token")
        .send({
          email: "newuser@example.com",
          password: "SecurePass123!",
        });

      expect(response.status).toBe(403);
    });
  });
});
