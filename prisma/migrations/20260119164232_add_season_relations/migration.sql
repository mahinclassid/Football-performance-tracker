-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Player" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "shirtNo" INTEGER,
    "dob" DATETIME,
    "heightCm" INTEGER,
    "weightKg" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Match" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "opponent" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "venue" TEXT,
    "result" TEXT,
    "seasonId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Match_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlayerMatchStat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerId" INTEGER NOT NULL,
    "matchId" INTEGER NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "started" BOOLEAN NOT NULL DEFAULT false,
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

-- CreateTable
CREATE TABLE "Season" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Club" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "manager" TEXT NOT NULL,
    "stadium" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "logo" TEXT,
    "location" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerMatchStat_playerId_matchId_key" ON "PlayerMatchStat"("playerId", "matchId");

-- CreateIndex
CREATE UNIQUE INDEX "Season_name_key" ON "Season"("name");
