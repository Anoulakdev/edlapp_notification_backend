-- CreateIndex
CREATE INDEX "Activity_startDate_idx" ON "Activity"("startDate");

-- CreateIndex
CREATE INDEX "Activity_endDate_idx" ON "Activity"("endDate");

-- CreateIndex
CREATE INDEX "Activity_createdById_idx" ON "Activity"("createdById");

-- CreateIndex
CREATE INDEX "Message_agentId_createdAt_idx" ON "Message"("agentId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "ProblemDoc_provinceId_problemstatusId_idx" ON "ProblemDoc"("provinceId", "problemstatusId");

-- CreateIndex
CREATE INDEX "ProblemDoc_branchId_createdAt_idx" ON "ProblemDoc"("branchId", "createdAt");
