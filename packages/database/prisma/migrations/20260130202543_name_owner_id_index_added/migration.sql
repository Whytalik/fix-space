-- DropIndex
DROP INDEX "Space_ownerId_idx";

-- CreateIndex
CREATE INDEX "Space_name_ownerId_idx" ON "Space"("name", "ownerId");
