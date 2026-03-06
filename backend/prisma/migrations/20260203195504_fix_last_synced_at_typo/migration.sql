/*
  Warnings:

  - You are about to drop the column `lasSyncedAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "lasSyncedAt",
ADD COLUMN     "lastSyncedAt" TIMESTAMP(3);
