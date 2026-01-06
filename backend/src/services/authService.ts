import argon2 from "argon2";
import { decrypt, encrypt } from "@/lib/encryption";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "@/lib/errors";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { LoginInput, RegisterInput } from "@/schemas/auth";
import { StravaService } from "./stravaServices";

const stravaService = new StravaService();

const safeUserProperties = {
  id: true,
  email: true,
  stravaAthleteId: true,
  username: true,
  firstName: true,
  lastName: true,
  bio: true,
  city: true,
  state: true,
  country: true,
  sex: true,
  weight: true,
  profileMedium: true,
  profile: true,
  friend: true,
  follower: true,
  badgeTypeId: true,
  premium: true,
  summit: true,
};

export class AuthService {
  async registerUser(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new BadRequestError("Cette adresse email est déjà utilisée.");
    }

    const hashedPassword = await argon2.hash(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
      },
      select: safeUserProperties,
    });

    return user;
  }

  async authenticateWithStrava(code: string, trailFramesUserId: string) {
    const tokenData = await stravaService.exchangeCodeForToken(code);

    const user = await prisma.user.update({
      where: { id: trailFramesUserId },
      data: {
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

  async getRefreshedStravaAccessToken(
    trailFramesUserId: string
  ): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: trailFramesUserId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const bufferTime = 5 * 60 * 1000; // 5 min in ms

    if (
      !user.stravaAccessToken ||
      !user.stravaRefreshToken ||
      !user.stravaTokenExpiresAt
    ) {
      throw new UnauthorizedError("Strava not authenticated");
    }

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

      logger.info(`Token refreshed for user: ${user.id}`);

      logger.info("Strava token refreshed", {
        userId: user.id,
        expiresAt: new Date(tokenData.expires_at * 1000).toISOString(),
      });

      return tokenData.access_token;
    }

    return decrypt(user.stravaAccessToken);
  }

  async loginUser(input: LoginInput) {
    const email = input.email;
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedError("Mot de passe ou email invalide");
    }

    const isPasswordValid = await argon2.verify(user.password, input.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Mot de passe ou email invalide");
    }

    const safeUser = await prisma.user.findUnique({
      where: { email },
      select: safeUserProperties,
    });

    if (!safeUser) {
      throw new NotFoundError("User not found");
    }

    return safeUser;
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: safeUserProperties,
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }
}
