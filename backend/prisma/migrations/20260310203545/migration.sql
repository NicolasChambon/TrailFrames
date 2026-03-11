-- CreateEnum
CREATE TYPE "SportType" AS ENUM ('AlpineSki', 'BackcountrySki', 'Badminton', 'Canoeing', 'Crossfit', 'EBikeRide', 'Elliptical', 'EMountainBikeRide', 'Golf', 'GravelRide', 'Handcycle', 'HighIntensityIntervalTraining', 'Hike', 'IceSkate', 'InlineSkate', 'Kayaking', 'Kitesurf', 'MountainBikeRide', 'NordicSki', 'Pickleball', 'Pilates', 'Racquetball', 'Ride', 'RockClimbing', 'RollerSki', 'Rowing', 'Run', 'Sail', 'Skateboard', 'Snowboard', 'Snowshoe', 'Soccer', 'Squash', 'StairStepper', 'StandUpPaddling', 'Surfing', 'Swim', 'TableTennis', 'Tennis', 'TrailRun', 'Velomobile', 'VirtualRide', 'VirtualRow', 'VirtualRun', 'Walk', 'WeightTraining', 'Wheelchair', 'Windsurf', 'Workout', 'Yoga');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('M', 'F', 'O');

-- CreateEnum
CREATE TYPE "PhotoSyncStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'ERROR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stravaAthleteId" BIGINT,
    "stravaAccessToken" TEXT,
    "stravaRefreshToken" TEXT,
    "stravaTokenExpiresAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3),
    "username" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "bio" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "sex" "Sex",
    "weight" DOUBLE PRECISION,
    "profileMedium" TEXT,
    "profile" TEXT,
    "friend" INTEGER,
    "follower" INTEGER,
    "badgeTypeId" INTEGER,
    "premium" BOOLEAN,
    "summit" BOOLEAN,
    "stravaCreatedAt" TIMESTAMP(3),
    "stravaUpdatedAt" TIMESTAMP(3),
    "photoSyncStatus" "PhotoSyncStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "photoSyncProcessed" INTEGER NOT NULL DEFAULT 0,
    "photoSyncTotal" INTEGER NOT NULL DEFAULT 0,
    "photoSyncResumedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "stravaActivityId" BIGINT NOT NULL,
    "trailFramesUserId" TEXT NOT NULL,
    "stravaAthleteId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "movingTime" INTEGER NOT NULL,
    "elapsedTime" INTEGER NOT NULL,
    "totalElevationGain" DOUBLE PRECISION NOT NULL,
    "elevHigh" DOUBLE PRECISION,
    "elevLow" DOUBLE PRECISION,
    "sportType" "SportType" NOT NULL,
    "stravaUploadId" BIGINT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "startDateLocal" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL,
    "startLatlng" DOUBLE PRECISION[],
    "endLatlng" DOUBLE PRECISION[],
    "achievementCount" INTEGER NOT NULL,
    "kudosCount" INTEGER NOT NULL,
    "commentCount" INTEGER NOT NULL,
    "athleteCount" INTEGER NOT NULL,
    "totalPhotoCount" INTEGER NOT NULL,
    "summaryPolyline" TEXT,
    "trainer" BOOLEAN NOT NULL,
    "commute" BOOLEAN NOT NULL,
    "manual" BOOLEAN NOT NULL,
    "private" BOOLEAN NOT NULL,
    "flagged" BOOLEAN NOT NULL,
    "workoutType" INTEGER,
    "averageSpeed" DOUBLE PRECISION NOT NULL,
    "maxSpeed" DOUBLE PRECISION NOT NULL,
    "hasKudoed" BOOLEAN NOT NULL,
    "gearId" TEXT,
    "kilojoules" DOUBLE PRECISION,
    "averageWatts" INTEGER,
    "deviceWatts" BOOLEAN,
    "maxWatts" INTEGER,
    "weightedAverageWatts" INTEGER,
    "photosLastFetchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" SERIAL NOT NULL,
    "stravaUniqueId" TEXT NOT NULL,
    "stravaActivityId" BIGINT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "location" DOUBLE PRECISION[],
    "stravaUploadedAt" TIMESTAMP(3) NOT NULL,
    "stravaCreatedAt" TIMESTAMP(3) NOT NULL,
    "stravaCreatedAtLocal" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stravaAthleteId_key" ON "User"("stravaAthleteId");

-- CreateIndex
CREATE INDEX "User_stravaAthleteId_idx" ON "User"("stravaAthleteId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_stravaActivityId_key" ON "Activity"("stravaActivityId");

-- CreateIndex
CREATE INDEX "Activity_trailFramesUserId_idx" ON "Activity"("trailFramesUserId");

-- CreateIndex
CREATE INDEX "Activity_startDate_idx" ON "Activity"("startDate");

-- CreateIndex
CREATE INDEX "Activity_sportType_idx" ON "Activity"("sportType");

-- CreateIndex
CREATE UNIQUE INDEX "Photo_stravaUniqueId_key" ON "Photo"("stravaUniqueId");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_trailFramesUserId_fkey" FOREIGN KEY ("trailFramesUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_stravaActivityId_fkey" FOREIGN KEY ("stravaActivityId") REFERENCES "Activity"("stravaActivityId") ON DELETE CASCADE ON UPDATE CASCADE;
