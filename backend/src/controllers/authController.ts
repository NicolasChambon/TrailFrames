import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { BadRequestError } from "@/lib/errors";
import { AuthService } from "@/services/authService";

const authService = new AuthService();

export class AuthController {
  // GET /auth/strava/callback?code=AUTH_CODE
  async handleCallback(req: Request, res: Response, next: NextFunction) {
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
}
