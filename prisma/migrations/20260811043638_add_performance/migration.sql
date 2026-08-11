-- CreateIndex
CREATE INDEX "Conversation_topicId_deletedAt_lastMessageAt_idx" ON "Conversation"("topicId", "deletedAt", "lastMessageAt" DESC);

-- CreateIndex
CREATE INDEX "CutpowerDoc_cutpowerDate_idx" ON "CutpowerDoc"("cutpowerDate");

-- CreateIndex
CREATE INDEX "CutpowerDoc_createdAt_idx" ON "CutpowerDoc"("createdAt");

-- CreateIndex
CREATE INDEX "EmergencyDoc_emergencyDate_idx" ON "EmergencyDoc"("emergencyDate");

-- CreateIndex
CREATE INDEX "EmergencyDoc_createdAt_idx" ON "EmergencyDoc"("createdAt");

-- CreateIndex
CREATE INDEX "ProblemDoc_createdAt_idx" ON "ProblemDoc"("createdAt");

-- CreateIndex
CREATE INDEX "RegisterMeter_createdAt_idx" ON "RegisterMeter"("createdAt");

-- CreateIndex
CREATE INDEX "TurnoffDoc_startDate_idx" ON "TurnoffDoc"("startDate");

-- CreateIndex
CREATE INDEX "TurnoffDoc_createdAt_idx" ON "TurnoffDoc"("createdAt");
