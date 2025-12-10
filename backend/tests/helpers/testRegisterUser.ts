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
    cookie.startsWith("accessToken=")
  );

  const refreshCookie = cookieArray.find((cookie: string) =>
    cookie.startsWith("refreshToken=")
  );

  const accessToken = accessCookie.split(";")[0].split("=")[1];

  const refreshToken = refreshCookie.split(";")[0].split("=")[1];

  return { userId, accessToken, refreshToken };
}
