import request from "supertest";
import { hashMockPasswords } from "tests/helpers/mockData";
import { getCsrfContext } from "tests/helpers/testCsrf";
import { getRegisteredUserContext } from "tests/helpers/testRegisterUser";
import { createTestApp } from "tests/helpers/testServer";
import { beforeEach, describe, expect, it } from "vitest";

const app = createTestApp();

describe("Refresh Token Integration Tests", () => {
  let csrfToken: string;
  let cookies: string[];

  beforeEach(async () => {
    // Get CSRF token for subsequent requests
    ({ csrfToken, cookies } = await getCsrfContext(app));

    await hashMockPasswords();
  });

  describe("POST /auth/refresh", () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Register to get token
      ({ refreshToken } = await getRegisteredUserContext(
        app,
        cookies,
        csrfToken
      ));
    });

    it("should refresh access token with valid refresh token", async () => {
      const response = await request(app)
        .post("/auth/refresh")
        .set("Cookie", [`refreshToken=${refreshToken}`, ...cookies])
        .set("X-CSRF-Token", csrfToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // New access token should be set
      const setCookies = response.headers["set-cookie"];
      const cookieArray = Array.isArray(setCookies) ? setCookies : [setCookies];

      expect(
        cookieArray.some((cookie: string) => cookie.startsWith("accessToken="))
      ).toBe(true);
    });

    it("should return 401 with invalid refresh token", async () => {
      const response = await request(app)
        .post("/auth/refresh")
        .set("Cookie", [`refreshToken=invalidtoken`, ...cookies])
        .set("X-CSRF-Token", csrfToken);

      expect(response.status).toBe(401);
    });
  });
});
