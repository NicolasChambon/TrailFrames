import { Application } from "express";
import request from "supertest";
import { mockUsers } from "./mockData";

export async function getRegisteredUserContext(
  app: Application,
  cookies: string[],
  csrfToken: string
) {
  const registerResponse = await request(app)
    .post("/auth/register")
    .set("Cookie", cookies)
    .set("X-CSRF-Token", csrfToken)
    .send({
      email: mockUsers.bobby.email,
      password: mockUsers.bobby.password,
    });

  const userId = registerResponse.body.user.id;

  const setCookies = registerResponse.headers["set-cookie"];
  const cookieArray = Array.isArray(setCookies) ? setCookies : [setCookies];

  const accessCookie = cookieArray.find((cookie: string) =>
    cookie.startsWith("access_token=")
  );

  const refreshCookie = cookieArray.find((cookie: string) =>
    cookie.startsWith("refresh_token=")
  );

  const accessToken = accessCookie!.split(";")[0].split("=")[1];

  const refreshToken = refreshCookie!.split(";")[0].split("=")[1];

  return { userId, accessToken, refreshToken };
}

/**
 * Login a user and return authentication cookies
 * This is the recommended way to authenticate users in tests
 * as it uses the real authentication flow
 */
export async function loginUser(
  app: Application,
  csrfCookies: string[],
  csrfToken: string,
  email: string = mockUsers.bobby.email,
  password: string = mockUsers.bobby.password
) {
  const loginResponse = await request(app)
    .post("/auth/login")
    .set("Cookie", csrfCookies)
    .set("X-CSRF-Token", csrfToken)
    .send({ email, password });

  if (loginResponse.status !== 200) {
    console.error("❌ Login failed:", {
      status: loginResponse.status,
      body: loginResponse.body,
      headers: loginResponse.headers,
    });
    throw new Error(
      `Login failed: ${loginResponse.status} ${JSON.stringify(loginResponse.body)}`
    );
  }

  const userId = loginResponse.body.user.id;

  // Get authentication cookies from response
  const setCookies = loginResponse.headers["set-cookie"];
  const authCookies = Array.isArray(setCookies) ? setCookies : [setCookies];

  // Extract cookie name=value pairs without metadata (HttpOnly, Secure, etc.)
  // This ensures consistent cookie handling across different environments
  const extractCookieValue = (cookie: string) => {
    return cookie.split(";")[0]; // Get only "name=value" part
  };

  // Merge CSRF cookies with auth cookies
  // Keep CSRF cookie from original cookies, add access_token and refresh_token
  const csrfCookieRaw = csrfCookies.find((c) => c.startsWith("_csrf="));
  const accessCookie = authCookies.find((c: string) =>
    c.startsWith("access_token=")
  );
  const refreshCookie = authCookies.find((c: string) =>
    c.startsWith("refresh_token=")
  );

  if (!csrfCookieRaw || !accessCookie || !refreshCookie) {
    console.error("❌ Missing cookies:", {
      csrfCookie: !!csrfCookieRaw,
      accessCookie: !!accessCookie,
      refreshCookie: !!refreshCookie,
      csrfCookies,
      authCookies,
    });
    throw new Error("Missing required cookies after login");
  }

  const allCookies = [
    extractCookieValue(csrfCookieRaw),
    extractCookieValue(accessCookie),
    extractCookieValue(refreshCookie),
  ];

  console.log("✅ Login successful, cookies:", allCookies);

  // Also return as a single string for maximum compatibility
  const cookieString = allCookies.join("; ");

  return { userId, cookies: allCookies, cookieString };
}
