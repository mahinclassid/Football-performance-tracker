-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PlayerMatchStat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerId" INTEGER NOT NULL,
    "matchId" INTEGER NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "started" BOOLEAN NOT NULL DEFAULT false,
    "substituted" BOOLEAN NOT NULL DEFAULT false,
    "minutes" INTEGER NOT NULL DEFAULT 0,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "yellow" INTEGER NOT NULL DEFAULT 0,
    "red" INTEGER NOT NULL DEFAULT 0,
    "tackles" INTEGER DEFAULT 0,
    "blocks" INTEGER DEFAULT 0,
    "saves" INTEGER DEFAULT 0,
    "rating" REAL,
    CONSTRAINT "PlayerMatchStat_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlayerMatchStat_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlayerMatchStat_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PlayerMatchStat" ("assists", "blocks", "goals", "id", "matchId", "minutes", "playerId", "rating", "red", "saves", "seasonId", "started", "tackles", "yellow") SELECT "assists", "blocks", "goals", "id", "matchId", "minutes", "playerId", "rating", "red", "saves", "seasonId", "started", "tackles", "yellow" FROM "PlayerMatchStat";
DROP TABLE "PlayerMatchStat";
ALTER TABLE "new_PlayerMatchStat" RENAME TO "PlayerMatchStat";
CREATE UNIQUE INDEX "PlayerMatchStat_playerId_matchId_key" ON "PlayerMatchStat"("playerId", "matchId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
