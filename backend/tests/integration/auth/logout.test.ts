import { seedTestUsers } from "@tests/helpers/mockData";
import { getCsrfContext } from "@tests/helpers/testCsrf";
import { createTestApp } from "@tests/helpers/testServer";
import { Application } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

describe("POST /auth/logout", () => {
  let app: Application;
  let csrfToken: string;
  let cookies: string[];
  let accessToken: string;
  let refreshToken: string;

  beforeEach(async () => {
    // Create app
    app = createTestApp();

    // Seed test users
    await seedTestUsers();

    // Get CSRF token
    ({ csrfToken, cookies } = await getCsrfContext(app));

    // Login to get tokens
    const loginResponse = await request(app)
      .post("/auth/login")
      .set("Cookie", cookies)
      .set("X-CSRF-Token", csrfToken)
      .send({
        email: "bobby@example.com",
        password: "SecurePass123!",
      });

    // Extract tokens from cookies
    const setCookies = Array.isArray(loginResponse.headers["set-cookie"])
      ? loginResponse.headers["set-cookie"]
      : [loginResponse.headers["set-cookie"]];

    const accessCookie = setCookies.find((cookie: string | undefined) =>
      cookie?.startsWith("access_token=")
    );
    const refreshCookie = setCookies.find((cookie: string | undefined) =>
      cookie?.startsWith("refresh_token=")
    );

    accessToken = accessCookie!.split(";")[0].split("=")[1];
    refreshToken = refreshCookie!.split(";")[0].split("=")[1];
  });

  it("should logout successfully and clear tokens", async () => {
    const response = await request(app)
      .post("/auth/logout")
      .set("Cookie", [
        `access_token=${accessToken}`,
        `refresh_token=${refreshToken}`,
        ...cookies,
      ])
      .set("X-CSRF-Token", csrfToken);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Cookies should be cleared
    const setCookies = response.headers["set-cookie"];
    const cookieArray = Array.isArray(setCookies) ? setCookies : [setCookies];

    expect(
      cookieArray.some((cookie: string) => cookie.includes("access_token=;"))
    ).toBe(true);
    expect(
      cookieArray.some((cookie: string) => cookie.includes("refresh_token=;"))
    ).toBe(true);
  });
});
