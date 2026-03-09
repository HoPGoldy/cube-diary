-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AccessToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "tokenPrefix" TEXT NOT NULL,
    "scopes" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" DATETIME
);
INSERT INTO "new_AccessToken" ("createdAt", "id", "lastUsedAt", "name", "tokenHash", "tokenPrefix") SELECT "createdAt", "id", "lastUsedAt", "name", "tokenHash", "tokenPrefix" FROM "AccessToken";
DROP TABLE "AccessToken";
ALTER TABLE "new_AccessToken" RENAME TO "AccessToken";
CREATE UNIQUE INDEX "AccessToken_tokenHash_key" ON "AccessToken"("tokenHash");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
