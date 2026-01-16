/*
  Warnings:

  - The primary key for the `Diary` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Diary` table. All the data in the column will be lost.
  - Added the required column `dateStr` to the `Diary` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Diary" (
    "dateStr" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "date" BIGINT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "color" TEXT
);
INSERT INTO "new_Diary" ("color", "content", "createdAt", "date", "updatedAt") SELECT "color", "content", "createdAt", "date", "updatedAt" FROM "Diary";
DROP TABLE "Diary";
ALTER TABLE "new_Diary" RENAME TO "Diary";
CREATE UNIQUE INDEX "Diary_date_key" ON "Diary"("date");
CREATE INDEX "Diary_date_idx" ON "Diary"("date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
