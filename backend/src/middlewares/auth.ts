import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "@/lib/errors";
import {
  clearAuthCookies,
  setAuthCookies,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/lib/jwt";
import { authCookiesSchema } from "@/schemas/auth";
import { TokenService } from "@/services/tokenService";

const tokenService = new TokenService();

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cookiesResult = authCookiesSchema.safeParse(req.cookies);

    if (!cookiesResult.success) {
      throw new UnauthorizedError("Invalid cookies");
    }

    const { access_token: accessToken, refresh_token: refreshToken } =
      cookiesResult.data;

    if (accessToken) {
      try {
        const payload = verifyAccessToken(accessToken);
        req.user = payload;
        return next();
      } catch (error) {
        next(error);
      }
    }

    if (refreshToken) {
      try {
        const payload = verifyRefreshToken(refreshToken);

        const validation = await tokenService.validateRefreshToken(
          refreshToken
        );

        if (!validation.valid) {
          throw new UnauthorizedError("Invalid or expired refresh token");
        }

        await tokenService.revokeRefreshToken(refreshToken);

        await setAuthCookies(res, {
          userId: payload.userId,
          email: payload.email,
        });

        req.user = payload;

        console.info(`Tokens auto-refreshed for user: ${payload.userId}`);
        return next();
      } catch (error) {
        await clearAuthCookies(res, refreshToken);
        next(error);
      }
    }

    throw new UnauthorizedError("Authentication required");
  } catch (error) {
    next(error);
  }
}
