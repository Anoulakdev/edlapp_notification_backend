-- CreateIndex
CREATE INDEX "User_roleId_idx" ON "User"("roleId");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_isOnline_idx" ON "User"("isOnline");

-- CreateIndex
CREATE INDEX "User_provinceId_idx" ON "User"("provinceId");

-- CreateIndex
CREATE INDEX "User_districtId_idx" ON "User"("districtId");

-- CreateIndex
CREATE INDEX "User_branchId_idx" ON "User"("branchId");

-- CreateIndex
CREATE INDEX "User_repairDistrictId_idx" ON "User"("repairDistrictId");

-- CreateIndex
CREATE INDEX "User_lastActiveAt_idx" ON "User"("lastActiveAt");

-- CreateIndex
CREATE INDEX "TurnoffDoc_voltageId_idx" ON "TurnoffDoc"("voltageId");

-- CreateIndex
CREATE INDEX "TurnoffAddress_villageId_idx" ON "TurnoffAddress"("villageId");

-- CreateIndex
CREATE INDEX "EmergencyDoc_voltageId_idx" ON "EmergencyDoc"("voltageId");

-- CreateIndex
CREATE INDEX "EmergencyAddress_villageId_idx" ON "EmergencyAddress"("villageId");

-- CreateIndex
CREATE INDEX "CutpowerDoc_voltageId_idx" ON "CutpowerDoc"("voltageId");

-- CreateIndex
CREATE INDEX "CutpowerAddress_villageId_idx" ON "CutpowerAddress"("villageId");

-- CreateIndex
CREATE INDEX "ProblemDoc_villageId_idx" ON "ProblemDoc"("villageId");

-- CreateIndex
CREATE INDEX "ProblemEquipment_typeEquipmentId_idx" ON "ProblemEquipment"("typeEquipmentId");
