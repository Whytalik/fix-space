-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isSystem" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "User_isSystem_idx" ON "User"("isSystem");
