/*
  Warnings:

  - You are about to drop the column `condition` on the `Automation` table. All the data in the column will be lost.
  - You are about to drop the column `config` on the `Database` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Database` table. All the data in the column will be lost.
  - You are about to drop the column `config` on the `IntegrationConnection` table. All the data in the column will be lost.
  - You are about to drop the column `group` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `config` on the `Record` table. All the data in the column will be lost.
  - You are about to drop the column `config` on the `Space` table. All the data in the column will be lost.
  - You are about to drop the column `isDemo` on the `Space` table. All the data in the column will be lost.
  - You are about to drop the column `config` on the `Template` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tokenHash]` on the table `EmailVerificationToken` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tokenHash]` on the table `PasswordResetToken` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tokenHash]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Automation_databaseId_idx";

-- DropIndex
DROP INDEX "Database_spaceId_idx";

-- DropIndex
DROP INDEX "EmailVerificationToken_tokenHash_idx";

-- DropIndex
DROP INDEX "GoogleAccount_googleId_idx";

-- DropIndex
DROP INDEX "GoogleAccount_userId_idx";

-- DropIndex
DROP INDEX "PasswordResetToken_tokenHash_idx";

-- DropIndex
DROP INDEX "Property_databaseId_idx";

-- DropIndex
DROP INDEX "Property_position_idx";

-- DropIndex
DROP INDEX "PropertyGroup_databaseId_idx";

-- DropIndex
DROP INDEX "PropertyGroup_position_idx";

-- DropIndex
DROP INDEX "PropertyValue_recordId_idx";

-- DropIndex
DROP INDEX "Record_createdAt_idx";

-- DropIndex
DROP INDEX "Record_databaseId_idx";

-- DropIndex
DROP INDEX "RefreshToken_tokenHash_idx";

-- DropIndex
DROP INDEX "Section_spaceId_idx";

-- DropIndex
DROP INDEX "Settings_userId_idx";

-- DropIndex
DROP INDEX "Space_ownerId_idx";

-- DropIndex
DROP INDEX "Template_databaseId_idx";

-- DropIndex
DROP INDEX "Template_position_idx";

-- DropIndex
DROP INDEX "TemplatePropertyValue_templateId_idx";

-- DropIndex
DROP INDEX "User_email_idx";

-- DropIndex
DROP INDEX "View_databaseId_idx";

-- AlterTable
ALTER TABLE "Automation" DROP COLUMN "condition";

-- AlterTable
ALTER TABLE "Database" DROP COLUMN "config",
DROP COLUMN "title";

-- AlterTable
ALTER TABLE "IntegrationConnection" DROP COLUMN "config";

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "group";

-- AlterTable
ALTER TABLE "Record" DROP COLUMN "config";

-- AlterTable
ALTER TABLE "Space" DROP COLUMN "config",
DROP COLUMN "isDemo";

-- AlterTable
ALTER TABLE "Template" DROP COLUMN "config";

-- CreateIndex
CREATE INDEX "Automation_databaseId_trigger_idx" ON "Automation"("databaseId", "trigger");

-- CreateIndex
CREATE INDEX "AutomationLog_automationId_createdAt_idx" ON "AutomationLog"("automationId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_tokenHash_key" ON "EmailVerificationToken"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "Property_databaseId_position_idx" ON "Property"("databaseId", "position");

-- CreateIndex
CREATE INDEX "Property_databaseId_type_idx" ON "Property"("databaseId", "type");

-- CreateIndex
CREATE INDEX "PropertyGroup_databaseId_position_idx" ON "PropertyGroup"("databaseId", "position");

-- CreateIndex
CREATE INDEX "Record_databaseId_createdAt_idx" ON "Record"("databaseId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "Section_spaceId_position_idx" ON "Section"("spaceId", "position");

-- CreateIndex
CREATE INDEX "Space_ownerId_isDefault_idx" ON "Space"("ownerId", "isDefault");

-- CreateIndex
CREATE INDEX "Template_databaseId_position_idx" ON "Template"("databaseId", "position");

-- CreateIndex
CREATE INDEX "Template_databaseId_isDefault_idx" ON "Template"("databaseId", "isDefault");

-- CreateIndex
CREATE INDEX "View_databaseId_position_idx" ON "View"("databaseId", "position");

-- CreateIndex
CREATE INDEX "View_databaseId_isDefault_idx" ON "View"("databaseId", "isDefault");
