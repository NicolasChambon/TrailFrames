import { Application } from "express";
import request from "supertest";

/**
 * Fetch CSRF token and associated cookies for a test
 *
 * @param app - The Express instance to use
 * @returns An object containing the CSRF token and cookies to send in subsequent requests
 *
 * @example
 * const { csrfToken, cookies } = await getCsrfContext(app);
 *
 * await request(app)
 *  .post('/auth/login')
 *  .set('Cookie', cookies)
 *  .send('X-CSRF-Token', csrfToken)
 *  .send({ email, password });
 */
export async function getCsrfContext(app: Application) {
  const csrfResponse = await request(app).get("/csrf-token");

  // Successful request verification
  if (csrfResponse.status !== 200) {
    throw new Error(
      `Failed to fetch CSRF token: ${csrfResponse.status} ${csrfResponse.text}`
    );
  }

  const csrfToken = csrfResponse.body.csrfToken;

  if (!csrfToken) {
    throw new Error("CSRF token not found in response body");
  }

  const setCookie = csrfResponse.headers["set-cookie"];
  const cookies = setCookie
    ? Array.isArray(setCookie)
      ? setCookie
      : [setCookie]
    : [];

  // CSRF cookie presence verification
  const hasCsrfCookie = cookies.some((cookie: string) =>
    cookie.startsWith("_csrf=")
  );

  if (!hasCsrfCookie) {
    throw new Error("CSRF cookie not found in response headers");
  }

  return { csrfToken, cookies };
}
