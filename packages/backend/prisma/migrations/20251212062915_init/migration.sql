-- CreateTable
CREATE TABLE "AppConfig" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MonitoredHost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "url" TEXT,
    "headers" JSONB,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "notifyEnabled" BOOLEAN NOT NULL DEFAULT false,
    "notifyFailureCount" INTEGER NOT NULL DEFAULT 3,
    "notifyCooldownMin" INTEGER NOT NULL DEFAULT 30,
    "notifyChannelIds" JSONB NOT NULL DEFAULT []
);

-- CreateTable
CREATE TABLE "EndPoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "hostId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "type" TEXT NOT NULL DEFAULT 'CONFIG',
    "url" TEXT,
    "method" TEXT DEFAULT 'GET',
    "headers" JSONB,
    "timeout" INTEGER,
    "bodyContentType" TEXT DEFAULT 'json',
    "bodyContent" TEXT,
    "codeContent" TEXT,
    "intervalTime" INTEGER,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "EndPoint_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "MonitoredHost" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProbeResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endPointId" TEXT NOT NULL,
    "status" INTEGER,
    "responseTime" INTEGER,
    "success" BOOLEAN NOT NULL,
    "message" TEXT,
    CONSTRAINT "ProbeResult_endPointId_fkey" FOREIGN KEY ("endPointId") REFERENCES "EndPoint" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProbeHourlyStat" (
    "endPointId" TEXT NOT NULL,
    "hourTimestamp" DATETIME NOT NULL,
    "totalChecks" INTEGER NOT NULL,
    "successCount" INTEGER NOT NULL,
    "avgResponseTime" INTEGER,
    "minResponseTime" INTEGER,
    "maxResponseTime" INTEGER,

    PRIMARY KEY ("endPointId", "hourTimestamp"),
    CONSTRAINT "ProbeHourlyStat_endPointId_fkey" FOREIGN KEY ("endPointId") REFERENCES "EndPoint" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProbeDailyStat" (
    "endPointId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "totalChecks" INTEGER NOT NULL,
    "successCount" INTEGER NOT NULL,
    "uptimePercentage" REAL,
    "avgResponseTime" INTEGER,
    "minResponseTime" INTEGER,
    "maxResponseTime" INTEGER,

    PRIMARY KEY ("endPointId", "date"),
    CONSTRAINT "ProbeDailyStat_endPointId_fkey" FOREIGN KEY ("endPointId") REFERENCES "EndPoint" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NotificationChannel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "webhookUrl" TEXT NOT NULL,
    "headers" JSONB,
    "bodyTemplate" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hostId" TEXT NOT NULL,
    "endpointId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "errorMsg" TEXT
);

-- CreateTable
CREATE TABLE "ProbeEnv" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "desc" TEXT
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "parentPath" TEXT,
    "tagIds" TEXT,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT,
    "listSubarticle" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "ArticleRelation" (
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,

    PRIMARY KEY ("fromId", "toId"),
    CONSTRAINT "ArticleRelation_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ArticleRelation_toId_fkey" FOREIGN KEY ("toId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "color" TEXT
);

-- CreateIndex
CREATE INDEX "Attachment_userId_idx" ON "Attachment"("userId");

-- CreateIndex
CREATE INDEX "ProbeResult_endPointId_createdAt_idx" ON "ProbeResult"("endPointId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ProbeResult_createdAt_idx" ON "ProbeResult"("createdAt");

-- CreateIndex
CREATE INDEX "ProbeHourlyStat_hourTimestamp_idx" ON "ProbeHourlyStat"("hourTimestamp");

-- CreateIndex
CREATE INDEX "ProbeDailyStat_date_idx" ON "ProbeDailyStat"("date");

-- CreateIndex
CREATE INDEX "NotificationLog_hostId_idx" ON "NotificationLog"("hostId");

-- CreateIndex
CREATE INDEX "NotificationLog_endpointId_idx" ON "NotificationLog"("endpointId");

-- CreateIndex
CREATE INDEX "NotificationLog_channelId_idx" ON "NotificationLog"("channelId");

-- CreateIndex
CREATE INDEX "NotificationLog_createdAt_idx" ON "NotificationLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProbeEnv_key_key" ON "ProbeEnv"("key");

-- CreateIndex
CREATE INDEX "Article_parentPath_idx" ON "Article"("parentPath");

-- CreateIndex
CREATE INDEX "ArticleRelation_fromId_idx" ON "ArticleRelation"("fromId");

-- CreateIndex
CREATE INDEX "ArticleRelation_toId_idx" ON "ArticleRelation"("toId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_title_key" ON "Tag"("title");
