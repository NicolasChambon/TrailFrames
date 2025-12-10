import { Application } from "express";
import request from "supertest";

export async function getCsrfContext(app: Application) {
  const csrfResponse = await request(app).get("/csrf-token");
  const csrfToken = csrfResponse.body.csrfToken;

  const setCookie = csrfResponse.headers["set-cookie"];

  const cookies = setCookie
    ? Array.isArray(setCookie)
      ? setCookie
      : [setCookie]
    : [];

  return { csrfToken, cookies };
}
