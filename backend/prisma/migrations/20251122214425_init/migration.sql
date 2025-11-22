-- CreateEnum
CREATE TYPE "SportType" AS ENUM ('AlpineSki', 'BackcountrySki', 'Badminton', 'Canoeing', 'Crossfit', 'EBikeRide', 'Elliptical', 'EMountainBikeRide', 'Golf', 'GravelRide', 'Handcycle', 'HighIntensityIntervalTraining', 'Hike', 'IceSkate', 'InlineSkate', 'Kayaking', 'Kitesurf', 'MountainBikeRide', 'NordicSki', 'Pickleball', 'Pilates', 'Racquetball', 'Ride', 'RockClimbing', 'RollerSki', 'Rowing', 'Run', 'Sail', 'Skateboard', 'Snowboard', 'Snowshoe', 'Soccer', 'Squash', 'StairStepper', 'StandUpPaddling', 'Surfing', 'Swim', 'TableTennis', 'Tennis', 'TrailRun', 'Velomobile', 'VirtualRide', 'VirtualRow', 'VirtualRun', 'Walk', 'WeightTraining', 'Wheelchair', 'Windsurf', 'Workout', 'Yoga');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('M', 'F', 'O');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "stravaAthleteId" BIGINT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "username" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "bio" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "sex" "Sex",
    "premium" BOOLEAN NOT NULL,
    "summit" BOOLEAN NOT NULL,
    "stravaCreatedAt" TIMESTAMP(3) NOT NULL,
    "stravaUpdatedAt" TIMESTAMP(3) NOT NULL,
    "badgeTypeId" INTEGER,
    "weight" DOUBLE PRECISION,
    "profileMedium" TEXT,
    "profile" TEXT,
    "friend" INTEGER,
    "follower" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "stravaActivityId" BIGINT NOT NULL,
    "trailFramesUserId" TEXT NOT NULL,
    "stravaAthleteId" BIGINT NOT NULL,
    "stravaUploadId" BIGINT,
    "name" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "movingTime" INTEGER NOT NULL,
    "elapsedTime" INTEGER NOT NULL,
    "totalElevationGain" DOUBLE PRECISION NOT NULL,
    "elevHigh" DOUBLE PRECISION,
    "elevLow" DOUBLE PRECISION,
    "sportType" "SportType" NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_stravaAthleteId_key" ON "User"("stravaAthleteId");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_stravaActivityId_key" ON "Activity"("stravaActivityId");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_trailFramesUserId_fkey" FOREIGN KEY ("trailFramesUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
