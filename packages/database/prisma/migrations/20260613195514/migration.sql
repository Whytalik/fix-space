-- AlterTable
ALTER TABLE "IntegrationConnection" ADD COLUMN     "spaceId" TEXT;

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "integrationKey" TEXT;

-- CreateIndex
CREATE INDEX "IntegrationConnection_spaceId_idx" ON "IntegrationConnection"("spaceId");

-- CreateIndex
CREATE INDEX "Property_integrationKey_idx" ON "Property"("integrationKey");

-- AddForeignKey
ALTER TABLE "IntegrationConnection" ADD CONSTRAINT "IntegrationConnection_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE SET NULL ON UPDATE CASCADE;
