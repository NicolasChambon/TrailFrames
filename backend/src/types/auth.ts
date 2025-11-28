import { User } from "@/generated/prisma";

// AuthenticatedUser type with decrypted tokens
export type AuthenticatedUser = Omit<
  User,
  "stravaAccessToken" | "stravaRefreshToken"
> & {
  stravaAccessToken: string;
  stravaRefreshToken: string;
};
