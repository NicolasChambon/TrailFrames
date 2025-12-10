import request from "supertest";
import { hashMockPasswords, mockUsers } from "tests/helpers/mockData";
import { getCsrfContext } from "tests/helpers/testCsrf";
import { createTestApp } from "tests/helpers/testServer";
import { beforeEach, describe, expect, it } from "vitest";

const app = createTestApp();

describe("User Login Integration Tests", () => {
  let csrfToken: string;
  let cookies: string[];

  beforeEach(async () => {
    // Get CSRF token for subsequent requests
    ({ csrfToken, cookies } = await getCsrfContext(app));

    await hashMockPasswords();
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
        cookieArray.some((cookie: string) => cookie.startsWith("accessToken="))
      ).toBe(true);
      expect(
        cookieArray.some((cookie: string) => cookie.startsWith("refreshToken="))
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
      expect(response.body.message).toContain("Invalid");
    });

    it("should return 404 if user does not exist", async () => {
      const response = await request(app)
        .post("/auth/login")
        .set("Cookie", cookies)
        .set("X-CSRF-Token", csrfToken)
        .send({
          email: "noneexistent@example.com",
          password: mockUsers.bobby.password,
        });

      expect(response.status).toBe(404);
    });
  });
});
