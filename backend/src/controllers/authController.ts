import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { StravaService } from "@/services/stravaServices";

const stravaService = new StravaService();

export class AuthController {
  async getAuthUrl(_req: Request, res: Response) {
    try {
      const clientId = process.env.STRAVA_CLIENT_ID;
      const redirectUri = `${process.env.FRONTEND_URL}/callback`;
      const scope = "read,activity:read_all,profile:read_all";

      const authUrl = `${process.env.STRAVA_API_URL}/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;

      res.status(200).json({ authUrl });
    } catch (error) {
      console.error("Error generating auth URL:", error);
      res.status(500).json({ error: "Failed to generate auth URL" });
    }
  }

  async handleCallback(req: Request, res: Response) {
    try {
      const { code } = req.query;

      if (!code || typeof code !== "string") {
        console.error("Missing or invalid authorization code");
        return res
          .status(400)
          .json({ error: "Missing authauthorization code" });
      }

      const tokenData = await stravaService.exchangeCodeForToken(code);

      const user = await prisma.user.upsert({
        where: { stravaUserId: tokenData.athlete.id },
        update: {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresAt: new Date(tokenData.expires_at * 1000),
        },
        create: {
          stravaUserId: tokenData.athlete.id,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresAt: new Date(tokenData.expires_at * 1000),
        },
      });

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
