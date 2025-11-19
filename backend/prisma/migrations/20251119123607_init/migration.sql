-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "stravaUserId" BIGINT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "stravaActivityId" BIGINT NOT NULL,
    "userId" TEXT NOT NULL,
    "stravaUserId" BIGINT NOT NULL,
    "stravaExternalId" TEXT NOT NULL,
    "stravaUploadId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "movingTime" INTEGER NOT NULL,
    "elapsedTime" INTEGER NOT NULL,
    "totalElevationGain" DOUBLE PRECISION NOT NULL,
    "elevHigh" DOUBLE PRECISION NOT NULL,
    "elevLow" DOUBLE PRECISION NOT NULL,
    "sportTypeId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "startDateLocal" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL,
    "startLatlng" DOUBLE PRECISION[],
    "endLatlng" DOUBLE PRECISION[],
    "achievementCount" INTEGER NOT NULL,
    "kudosCount" INTEGER NOT NULL,
    "commentCount" INTEGER NOT NULL,
    "athleteCount" INTEGER NOT NULL,
    "photoCount" INTEGER NOT NULL,
    "totalPhotoCount" INTEGER NOT NULL,
    "polyline" TEXT,
    "summaryPolyline" TEXT,
    "trainer" BOOLEAN NOT NULL,
    "commute" BOOLEAN NOT NULL,
    "manual" BOOLEAN NOT NULL,
    "private" BOOLEAN NOT NULL,
    "flagged" BOOLEAN NOT NULL,
    "workoutType" INTEGER NOT NULL,
    "stravaUploadIdStr" TEXT NOT NULL,
    "averageSpeed" DOUBLE PRECISION NOT NULL,
    "maxSpeed" DOUBLE PRECISION NOT NULL,
    "hasKudoed" BOOLEAN NOT NULL,
    "hideFromHome" BOOLEAN NOT NULL,
    "gearId" TEXT NOT NULL,
    "kilojoules" DOUBLE PRECISION NOT NULL,
    "averageWatts" INTEGER NOT NULL,
    "deviceWatts" BOOLEAN NOT NULL,
    "maxWatts" INTEGER NOT NULL,
    "weightedAverageWatts" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SportType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "SportType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_stravaUserId_key" ON "User"("stravaUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_stravaActivityId_key" ON "Activity"("stravaActivityId");

-- CreateIndex
CREATE UNIQUE INDEX "SportType_name_key" ON "SportType"("name");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_sportTypeId_fkey" FOREIGN KEY ("sportTypeId") REFERENCES "SportType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
