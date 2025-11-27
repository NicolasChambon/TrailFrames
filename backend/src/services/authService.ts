import { prisma } from "@/lib/prisma";
import { StravaService } from "./stravaServices";

const stravaService = new StravaService();

export class AuthService {
  async authenticateWithStrava(code: string) {
    const tokenData = await stravaService.exchangeCodeForToken(code);

    const user = await prisma.user.upsert({
      where: { stravaAthleteId: tokenData.athlete.id },
      update: {
        stravaAccessToken: tokenData.access_token,
        stravaRefreshToken: tokenData.refresh_token,
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
        stravaAccessToken: tokenData.access_token,
        stravaRefreshToken: tokenData.refresh_token,
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
}
