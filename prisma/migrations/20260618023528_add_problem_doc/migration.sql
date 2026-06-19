-- CreateTable
CREATE TABLE "ProblemType" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(255),

    CONSTRAINT "ProblemType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemStatus" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "ProblemStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemDoc" (
    "id" SERIAL NOT NULL,
    "problemtypeId" INTEGER NOT NULL,
    "fullName" VARCHAR(255),
    "description" VARCHAR(255),
    "tel" VARCHAR(255) NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "problemImg" VARCHAR(255),
    "provinceId" INTEGER,
    "districtId" INTEGER,
    "villageId" INTEGER,
    "problemstatusId" INTEGER NOT NULL DEFAULT 1,
    "sourceId" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "ProblemDoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemAssign" (
    "id" SERIAL NOT NULL,
    "problemId" INTEGER NOT NULL,
    "userReceiverId" INTEGER,
    "userActiveId" INTEGER,
    "commentText" VARCHAR(255),
    "commentAudio" VARCHAR(255),
    "commentImg" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "ProblemAssign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProblemDoc_problemtypeId_idx" ON "ProblemDoc"("problemtypeId");

-- CreateIndex
CREATE INDEX "ProblemDoc_problemstatusId_idx" ON "ProblemDoc"("problemstatusId");

-- CreateIndex
CREATE INDEX "ProblemDoc_sourceId_idx" ON "ProblemDoc"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "ProblemAssign_problemId_key" ON "ProblemAssign"("problemId");

-- CreateIndex
CREATE INDEX "ProblemAssign_problemId_idx" ON "ProblemAssign"("problemId");

-- AddForeignKey
ALTER TABLE "ProblemDoc" ADD CONSTRAINT "ProblemDoc_problemtypeId_fkey" FOREIGN KEY ("problemtypeId") REFERENCES "ProblemType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemDoc" ADD CONSTRAINT "ProblemDoc_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemDoc" ADD CONSTRAINT "ProblemDoc_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemDoc" ADD CONSTRAINT "ProblemDoc_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemDoc" ADD CONSTRAINT "ProblemDoc_problemstatusId_fkey" FOREIGN KEY ("problemstatusId") REFERENCES "ProblemStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemDoc" ADD CONSTRAINT "ProblemDoc_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemAssign" ADD CONSTRAINT "ProblemAssign_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "ProblemDoc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemAssign" ADD CONSTRAINT "ProblemAssign_userReceiverId_fkey" FOREIGN KEY ("userReceiverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemAssign" ADD CONSTRAINT "ProblemAssign_userActiveId_fkey" FOREIGN KEY ("userActiveId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
