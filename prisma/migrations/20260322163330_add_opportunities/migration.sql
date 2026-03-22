-- CreateEnum
CREATE TYPE "OpportunityStatus" AS ENUM ('draft', 'sent', 'replied', 'won', 'lost', 'paused');

-- CreateTable
CREATE TABLE "opportunities" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "companyName" TEXT,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "valueAmount" DECIMAL(12,2),
    "currency" TEXT,
    "notes" TEXT,
    "status" "OpportunityStatus" NOT NULL,
    "quoteSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "opportunities_workspaceId_status_idx" ON "opportunities"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "opportunities_workspaceId_createdAt_idx" ON "opportunities"("workspaceId", "createdAt");

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
