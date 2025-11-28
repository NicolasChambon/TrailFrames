import { decrypt, encrypt } from "@/lib/encryption";
import { NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { AuthenticatedUser } from "@/types/auth";
import { StravaService } from "./stravaServices";

const stravaService = new StravaService();

export class AuthService {
  async authenticateWithStrava(code: string) {
    const tokenData = await stravaService.exchangeCodeForToken(code);

    const user = await prisma.user.upsert({
      where: { stravaAthleteId: tokenData.athlete.id },
      update: {
        stravaAccessToken: encrypt(tokenData.access_token),
        stravaRefreshToken: encrypt(tokenData.refresh_token),
        stravaTokenExpiresAt: new Date(tokenData.expires_at * 1000),
        username: tokenData.athlete.username,
        firstName: tokenData.athlete.firstname,
        lastName: tokenData.athlete.lastname,
        bio: tokenData.athlete.bio,
        city: tokenData.athlete.city,
        state: tokenData.athlete.state,
        country: tokenData.athlete.country,
        sex: tokenData.athlete.sex,
        premium: tokenData.athlete.premium,
        summit: tokenData.athlete.summit,
        stravaCreatedAt: new Date(tokenData.athlete.created_at),
        stravaUpdatedAt: new Date(tokenData.athlete.updated_at),
        badgeTypeId: tokenData.athlete.badge_type_id,
        weight: tokenData.athlete.weight,
        profileMedium: tokenData.athlete.profile_medium,
        profile: tokenData.athlete.profile,
        friend: tokenData.athlete.friend,
        follower: tokenData.athlete.follower,
      },
      create: {
        stravaAthleteId: tokenData.athlete.id,
        stravaAccessToken: encrypt(tokenData.access_token),
        stravaRefreshToken: encrypt(tokenData.refresh_token),
        stravaTokenExpiresAt: new Date(tokenData.expires_at * 1000),
        username: tokenData.athlete.username,
        firstName: tokenData.athlete.firstname,
        lastName: tokenData.athlete.lastname,
        bio: tokenData.athlete.bio,
        city: tokenData.athlete.city,
        state: tokenData.athlete.state,
        country: tokenData.athlete.country,
        sex: tokenData.athlete.sex,
        premium: tokenData.athlete.premium,
        summit: tokenData.athlete.summit,
        stravaCreatedAt: new Date(tokenData.athlete.created_at),
        stravaUpdatedAt: new Date(tokenData.athlete.updated_at),
        badgeTypeId: tokenData.athlete.badge_type_id,
        weight: tokenData.athlete.weight,
        profileMedium: tokenData.athlete.profile_medium,
        profile: tokenData.athlete.profile,
        friend: tokenData.athlete.friend,
        follower: tokenData.athlete.follower,
      },
    });

    return user;
  }

  async getAuthenticatedUser(
    trailFramesUserId: string
  ): Promise<AuthenticatedUser> {
    const user = await prisma.user.findUnique({
      where: { id: trailFramesUserId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const bufferTime = 5 * 60 * 1000; // 5 min in ms
    const isTokenExpiringSoon =
      new Date().getTime() + bufferTime > user.stravaTokenExpiresAt.getTime();

    if (isTokenExpiringSoon) {
      const tokenData = await stravaService.refreshAccessToken(
        user.stravaRefreshToken
      );

      await prisma.user.update({
        where: { id: trailFramesUserId },
        data: {
          stravaAccessToken: encrypt(tokenData.access_token),
          stravaRefreshToken: encrypt(tokenData.refresh_token),
          stravaTokenExpiresAt: new Date(tokenData.expires_at * 1000),
        },
      });

      console.info(`Token refreshed for user: ${user.id}`);

      return {
        ...user,
        stravaAccessToken: tokenData.access_token,
        stravaRefreshToken: tokenData.refresh_token,
        stravaTokenExpiresAt: new Date(tokenData.expires_at * 1000),
      };
    }

    return {
      ...user,
      stravaAccessToken: decrypt(user.stravaAccessToken),
      stravaRefreshToken: decrypt(user.stravaRefreshToken),
    };
  }
}
