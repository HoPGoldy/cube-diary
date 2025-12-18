/*
  Warnings:

  - You are about to drop the `ArticleRelation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EndPoint` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MonitoredHost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NotificationChannel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NotificationLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProbeDailyStat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProbeEnv` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProbeHourlyStat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProbeResult` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN "thumbPath" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ArticleRelation";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EndPoint";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MonitoredHost";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "NotificationChannel";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "NotificationLog";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ProbeDailyStat";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ProbeEnv";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ProbeHourlyStat";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ProbeResult";
PRAGMA foreign_keys=on;
