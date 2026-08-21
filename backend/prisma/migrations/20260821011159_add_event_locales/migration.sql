-- CreateTable
CREATE TABLE "Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gancioId" INTEGER NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'melbourne',
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "startDatetime" DATETIME NOT NULL,
    "endDatetime" DATETIME,
    "placeName" TEXT,
    "placeAddress" TEXT,
    "imageUrl" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "ticketUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SyncStatus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lastSyncedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "eventCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_locale_gancioId_key" ON "Event"("locale", "gancioId");
