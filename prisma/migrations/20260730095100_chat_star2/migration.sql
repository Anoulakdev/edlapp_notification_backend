-- AlterTable
ALTER TABLE "AgentRating" ADD COLUMN IF NOT EXISTS "messageId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AgentRating_messageId_key" ON "AgentRating"("messageId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'AgentRating_messageId_fkey'
    ) THEN
        ALTER TABLE "AgentRating" ADD CONSTRAINT "AgentRating_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
