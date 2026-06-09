/*
  Warnings:

  - You are about to drop the column `recordLimit` on the `Database` table. All the data in the column will be lost.
  - You are about to drop the column `useDefaultTemplate` on the `Database` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Database" DROP COLUMN "recordLimit",
DROP COLUMN "useDefaultTemplate";

-- AlterTable
ALTER TABLE "View" ADD COLUMN     "defaultTemplateId" TEXT,
ADD COLUMN     "recordLimit" INTEGER,
ADD COLUMN     "useDefaultTemplate" BOOLEAN NOT NULL DEFAULT true;
