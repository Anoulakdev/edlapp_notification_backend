-- CreateIndex
CREATE INDEX "EmergencyDoc_emergencyDate_startTime_idx" ON "EmergencyDoc"("emergencyDate", "startTime");

-- CreateIndex
CREATE INDEX "EmergencyDoc_emergencyStatusId_idx" ON "EmergencyDoc"("emergencyStatusId");

-- CreateIndex
CREATE INDEX "TurnoffDoc_startDate_startTime_idx" ON "TurnoffDoc"("startDate", "startTime");

-- CreateIndex
CREATE INDEX "TurnoffDoc_turnoffStatusId_idx" ON "TurnoffDoc"("turnoffStatusId");
