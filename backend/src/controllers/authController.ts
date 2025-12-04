import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { BadRequestError } from "@/lib/errors";
import {
  clearAuthCookies,
  REFRESH_COOKIE_NAME,
  setAuthCookies,
  verifyRefreshToken,
} from "@/lib/jwt";
import { AuthenticatedRequest } from "@/middleware/auth";
import { loginSchema, registerSchema } from "@/schemas/auth";
import { AuthService } from "@/services/authService";

const authService = new AuthService();

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

    setAuthCookies(res, { userId: user.id, email: user.email });

    console.info(`User registered and logged in: ${user.id}`);
    res.status(201).json({
      success: true,
      user,
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

    setAuthCookies(res, { userId: user.id, email: user.email });

    console.info(`User logged in: ${user.id}`);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
}

// POST /auth/refresh
export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const parseResult = z
      .string()
      .min(1)
      .safeParse(req.cookies[REFRESH_COOKIE_NAME]);

    if (!parseResult.success) {
      throw new BadRequestError(parseResult.error.message);
    }

    const refreshToken = parseResult.data;

    if (!refreshToken) {
      throw new BadRequestError("Refresh token not found");
    }

    const payload = verifyRefreshToken(refreshToken);

    setAuthCookies(res, { userId: payload.userId, email: payload.email });

    console.info(`Tokens refreshed for user: ${payload.userId}`);
    res.status(200).json({
      success: true,
      message: "Tokens refreshed successfully",
    });
  } catch (error) {
    clearAuthCookies(res);
    next(error);
  }
}

// POST /auth/logout
export async function logout(_: Request, res: Response) {
  clearAuthCookies(res);

  console.info("User ${req.user?.id} logged out");
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
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
    const userId = (req as AuthenticatedRequest).user.userId;

    const user = await authService.authenticateWithStrava(code, userId);

    console.info(`User authenticated on Strava: ${user.id}`);
    res.status(200).json({
      success: true,
      trailFramesUserId: user.id,
      message: "Strava authentication successful",
    });
  } catch (error) {
    next(error);
  }
}
