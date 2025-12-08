import { Response } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { TokenService } from "@/services/tokenService";

const tokenService = new TokenService();

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const JWT_ACCESS_SECRET = getRequiredEnv("JWT_ACCESS_SECRET");
const JWT_REFRESH_SECRET = getRequiredEnv("JWT_REFRESH_SECRET");

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

const ACCESS_COOKIE_NAME = "access_token";
const REFRESH_COOKIE_NAME = "refresh_token";

export interface JwtPayload {
  userId: string;
  email: string;
}

export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
}

export async function setAuthCookies(
  res: Response,
  payload: JwtPayload
): Promise<void> {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await tokenService.saveRefreshToken(payload.userId, refreshToken);

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie(ACCESS_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 15 * 60 * 1000, // 15 min in ms
  });

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });
}

export async function clearAuthCookies(
  res: Response,
  refreshToken: string
): Promise<void> {
  await tokenService.revokeRefreshToken(refreshToken);

  res.clearCookie(ACCESS_COOKIE_NAME);
  res.clearCookie(REFRESH_COOKIE_NAME);
}

export { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME };
