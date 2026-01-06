import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { BadRequestError, UnauthorizedError } from "@/lib/errors";
import {
  clearAuthCookies,
  JwtPayload,
  REFRESH_COOKIE_NAME,
  setAuthCookies,
  verifyRefreshToken,
} from "@/lib/jwt";
import { logger } from "@/lib/logger";
import { loginSchema, registerSchema } from "@/schemas/auth";
import { AuthService } from "@/services/authService";
import { TokenService } from "@/services/tokenService";

const authService = new AuthService();
const tokenService = new TokenService();

// POST /auth/register
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parseResult = registerSchema.safeParse(req.body);

    if (!parseResult.success) {
      throw new BadRequestError(parseResult.error.message);
    }

    const user = await authService.registerUser(parseResult.data);

    await setAuthCookies(res, { userId: user.id, email: user.email });

    logger.info("User registered and logged in", {
      userId: user.id,
      email: user.email,
    });

    const userResponse = {
      ...user,
      stravaAthleteId: user.stravaAthleteId?.toString() ?? null,
    };

    res.status(201).json({
      success: true,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
}

// POST /auth/login
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const parseResult = loginSchema.safeParse(req.body);

    if (!parseResult.success) {
      throw new BadRequestError(parseResult.error.message);
    }

    const user = await authService.loginUser(parseResult.data);

    await setAuthCookies(res, { userId: user.id, email: user.email });

    logger.info("User logged in", {
      userId: user.id,
      email: user.email,
    });

    const userResponse = {
      ...user,
      stravaAthleteId: user.stravaAthleteId?.toString() ?? null,
    };

    res.status(200).json({
      success: true,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
}

// POST /auth/refresh
export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies[REFRESH_COOKIE_NAME];

    if (!refreshToken) {
      throw new BadRequestError("Refresh token not found");
    }

    const parseResult = z.string().min(1).safeParse(refreshToken);

    if (!parseResult.success) {
      throw new BadRequestError("Invalid refresh token format");
    }

    let payload: JwtPayload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const validation = await tokenService.validateRefreshToken(refreshToken);

    if (!validation.valid) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    await tokenService.revokeRefreshToken(refreshToken);

    await setAuthCookies(res, { userId: payload.userId, email: payload.email });

    logger.info("Tokens refreshed", { userId: payload.userId });

    res.status(200).json({
      success: true,
      message: "Tokens refreshed successfully",
    });
  } catch (error) {
    const refreshToken = req.cookies[REFRESH_COOKIE_NAME];
    if (refreshToken) {
      await clearAuthCookies(res, refreshToken);
    }
    next(error);
  }
}

// POST /auth/logout
export async function logout(req: Request, res: Response) {
  const refreshToken = req.cookies[REFRESH_COOKIE_NAME];

  await clearAuthCookies(res, refreshToken);

  logger.info("User logged out", { userId: req.user?.userId });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}

// GET /auth/current-user
export async function getCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    const user = await authService.getUserById(userId);

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    const userResponse = {
      ...user,
      stravaAthleteId: user.stravaAthleteId?.toString() ?? null,
    };

    res.status(200).json({
      success: true,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
}

// GET /auth/strava/callback?code=AUTH_CODE
export async function handleCallback(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const querySchema = z.object({
      code: z.string().min(1),
    });

    const parseResult = querySchema.safeParse(req.query);

    if (!parseResult.success) {
      throw new BadRequestError(parseResult.error.message);
    }

    const { code } = parseResult.data;

    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const userId = req.user.userId;

    const user = await authService.authenticateWithStrava(code, userId);

    logger.info("User authenticated on Strava", {
      userId: user.id,
      stravaAthleteId: user.stravaAthleteId,
    });

    res.status(200).json({
      success: true,
      trailFramesUserId: user.id,
      message: "Strava authentication successful",
    });
  } catch (error) {
    next(error);
  }
}
