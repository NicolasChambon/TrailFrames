-- AlterTable
-- Step 1: Add new columns as nullable first
ALTER TABLE "User" 
ADD COLUMN "stravaAccessToken" TEXT,
ADD COLUMN "stravaRefreshToken" TEXT,
ADD COLUMN "stravaTokenExpiresAt" TIMESTAMP(3);

-- Step 2: Copy data from old columns to new columns
UPDATE "User" 
SET "stravaAccessToken" = "accessToken",
    "stravaRefreshToken" = "refreshToken",
    "stravaTokenExpiresAt" = "expiresAt";

-- Step 3: Make new columns NOT NULL
ALTER TABLE "User" 
ALTER COLUMN "stravaAccessToken" SET NOT NULL,
ALTER COLUMN "stravaRefreshToken" SET NOT NULL,
ALTER COLUMN "stravaTokenExpiresAt" SET NOT NULL;

-- Step 4: Drop old columns
ALTER TABLE "User" 
DROP COLUMN "accessToken",
DROP COLUMN "expiresAt",
DROP COLUMN "refreshToken";
