-- CreateTable
CREATE TABLE "Diary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "date" BIGINT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "color" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Diary_date_key" ON "Diary"("date");

-- CreateIndex
CREATE INDEX "Diary_date_idx" ON "Diary"("date");
