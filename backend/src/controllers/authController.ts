import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { BadRequestError } from "@/lib/errors";
import { setAuthCookie } from "@/lib/jwt";
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

    setAuthCookie(res, { userId: user.id, email: user.email });

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

    setAuthCookie(res, { userId: user.id, email: user.email });

    console.info(`User logged in: ${user.id}`);
    res.status(200).json({
      success: true,
      user,
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

    const user = await authService.authenticateWithStrava(code);

    console.info(`User authenticated: ${user.id}`);
    res.status(200).json({
      success: true,
      trailFramesUserId: user.id,
      message: "Authentication successful",
    });
  } catch (error) {
    next(error);
  }
}
