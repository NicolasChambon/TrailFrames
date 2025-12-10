import request from "supertest";
import { hashMockPasswords, mockUsers } from "tests/helpers/mockData";
import { getCsrfContext } from "tests/helpers/testCsrf";
import { getTestPrisma } from "tests/helpers/testDb";
import { createTestApp } from "tests/helpers/testServer";
import { describe, it, beforeEach, expect } from "vitest";

const app = createTestApp();
const prisma = getTestPrisma();

describe("User Registration Integration Tests", () => {
  let csrfToken: string;
  let cookies: string[];

  beforeEach(async () => {
    // Get CSRF token for subsequent requests
    ({ csrfToken, cookies } = await getCsrfContext(app));

    await hashMockPasswords();
  });

  describe("POST /auth/register", () => {
    it("should register a new user successfully", async () => {
      const response = await request(app)
        .post("/auth/register")
        .set("Cookie", cookies)
        .set("X-CSRF-Token", csrfToken)
        .send({
          email: mockUsers.bobby.email,
          password: mockUsers.bobby.password,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(mockUsers.bobby.email);
      expect(response.body.user.password).toBeUndefined(); // Password should not be returned

      // Check cookies are set
      const setCookies = response.headers["set-cookie"];

      expect(setCookies).toBeDefined();

      const cookieArray = Array.isArray(setCookies) ? setCookies : [setCookies];

      expect(
        cookieArray.some((cookie: string) => cookie.startsWith("accessToken="))
      ).toBe(true);
      expect(
        cookieArray.some((cookie: string) => cookie.startsWith("refreshToken="))
      ).toBe(true);

      // Verify user is in the database
      const user = await prisma.user.findUnique({
        where: { email: mockUsers.bobby.email },
      });
      expect(user).toBeDefined();
      expect(user?.email).toBe(mockUsers.bobby.email);
    });

    it("should return 400 if email already exists", async () => {
      // Create user first
      await prisma.user.create({
        data: {
          email: mockUsers.bobby.email,
          password: mockUsers.bobby.hashedPassword,
        },
      });

      const response = await request(app)
        .post("/auth/register")
        .set("Cookie", cookies)
        .set("X-CSRF-Token", csrfToken)
        .send({
          email: mockUsers.bobby.email,
          password: mockUsers.bobby.password,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Email already in use");
    });

    it("should return 400 if email is invalid", async () => {
      const response = await request(app)
        .post("/auth/register")
        .set("Cookie", cookies)
        .set("X-CSRF-Token", csrfToken)
        .send({
          email: "invalid-email",
          password: mockUsers.bobby.password,
        });
      expect(response.status).toBe(400);
    });

    it("should return 400 if password is too weak", async () => {
      const response = await request(app)
        .post("/auth/register")
        .set("Cookie", cookies)
        .set("X-CSRF-Token", csrfToken)
        .send({
          email: mockUsers.bobby.email,
          password: "weak",
        });
      expect(response.status).toBe(400);
    });
  });
});
