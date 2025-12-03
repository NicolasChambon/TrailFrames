/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT NOT NULL,
ALTER COLUMN "stravaAthleteId" DROP NOT NULL,
ALTER COLUMN "stravaAccessToken" DROP NOT NULL,
ALTER COLUMN "stravaRefreshToken" DROP NOT NULL,
ALTER COLUMN "stravaTokenExpiresAt" DROP NOT NULL,
ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL,
ALTER COLUMN "premium" DROP NOT NULL,
ALTER COLUMN "summit" DROP NOT NULL,
ALTER COLUMN "stravaCreatedAt" DROP NOT NULL,
ALTER COLUMN "stravaUpdatedAt" DROP NOT NULL;
