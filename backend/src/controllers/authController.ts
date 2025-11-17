import { Request, Response } from "express";
import { z } from "zod";
import { AuthService } from "@/services/authService";

const authService = new AuthService();

export class AuthController {
  // GET /auth/strava/callback?code=AUTH_CODE
  async handleCallback(req: Request, res: Response) {
    try {
      const querySchema = z.object({
        code: z.string().min(1),
      });

      const parseResult = querySchema.safeParse(req.query);

      if (!parseResult.success) {
        console.error("Zod validation error:", parseResult.error.message);
        return res.status(400).json({ error: parseResult.error.message });
      }

      const { code } = parseResult.data;

      const user = await authService.authenticateWithStrava(code);

      res.status(200).json({
        success: true,
        userId: user.id,
        message: "Authentication successful",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      console.error("Error in callback handling:", errorMessage);
      res.status(500).json({ error: "Authentication failed" });
    }
  }
}
