import request from "supertest";
import { hashMockPasswords } from "tests/helpers/mockData";
import { getCsrfContext } from "tests/helpers/testCsrf";
import { getRegisteredUserContext } from "tests/helpers/testRegisterUser";
import { createTestApp } from "tests/helpers/testServer";
import { beforeEach, describe, expect, it } from "vitest";

const app = createTestApp();

describe("Logout Integration Tests", () => {
  let csrfToken: string;
  let cookies: string[];

  beforeEach(async () => {
    // Get CSRF token for subsequent requests
    ({ csrfToken, cookies } = await getCsrfContext(app));

    await hashMockPasswords();
  });

  describe("POST /auth/logout", () => {
    let accessToken: string;
    let refreshToken: string;

    beforeEach(async () => {
      // Register to get tokens
      ({ accessToken, refreshToken } = await getRegisteredUserContext(
        app,
        cookies,
        csrfToken
      ));
    });

    it("should logout successfully and clear tokens", async () => {
      const response = await request(app)
        .post("/auth/logout")
        .set("Cookie", [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
          ...cookies,
        ])
        .set("X-CSRF-Token", csrfToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Cookies should be cleared
      const setCookies = response.headers["set-cookie"];
      const cookieArray = Array.isArray(setCookies) ? setCookies : [setCookies];

      expect(
        cookieArray.some((cookie: string) => cookie.includes("accessToken=;"))
      ).toBe(true);
      expect(
        cookieArray.some((cookie: string) => cookie.includes("refreshToken=;"))
      ).toBe(true);
    });
  });
});
