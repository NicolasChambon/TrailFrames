import { prisma } from "@/lib/prisma";
import { StravaService } from "./stravaServices";

const stravaService = new StravaService();

export class AuthService {
  async authenticateWithStrava(code: string) {
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

    return user;
  }
}
