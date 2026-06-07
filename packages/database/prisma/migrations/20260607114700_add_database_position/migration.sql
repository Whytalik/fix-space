-- AlterTable
ALTER TABLE "Database" ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Database_position_idx" ON "Database"("position");
