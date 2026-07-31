-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMPTZ(0);

-- AlterTable
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMPTZ(0);

-- AlterTable
ALTER TABLE "TurnoffDoc" ADD COLUMN IF NOT EXISTS "useTime" INTEGER;

-- CreateTable
CREATE TABLE IF NOT EXISTS "AgentRating" (
    "id" SERIAL NOT NULL,
    "agentId" INTEGER NOT NULL,
    "externalUserId" INTEGER NOT NULL,
    "topicId" INTEGER,
    "conversationId" INTEGER,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AgentRating_agentId_idx" ON "AgentRating"("agentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AgentRating_externalUserId_idx" ON "AgentRating"("externalUserId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AgentRating_topicId_idx" ON "AgentRating"("topicId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AgentRating_createdAt_idx" ON "AgentRating"("createdAt");

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AgentRating_agentId_fkey') THEN
        ALTER TABLE "AgentRating" ADD CONSTRAINT "AgentRating_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AgentRating_externalUserId_fkey') THEN
        ALTER TABLE "AgentRating" ADD CONSTRAINT "AgentRating_externalUserId_fkey" FOREIGN KEY ("externalUserId") REFERENCES "ExternalUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AgentRating_topicId_fkey') THEN
        ALTER TABLE "AgentRating" ADD CONSTRAINT "AgentRating_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AgentRating_conversationId_fkey') THEN
        ALTER TABLE "AgentRating" ADD CONSTRAINT "AgentRating_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
