/*
  Warnings:

  - A unique constraint covering the columns `[externalUserId,topicId]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Conversation_externalUserId_topicId_key" ON "Conversation"("externalUserId", "topicId");
