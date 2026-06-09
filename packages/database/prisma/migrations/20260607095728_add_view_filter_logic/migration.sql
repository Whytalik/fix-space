/*
  Warnings:

  - The values [BUTTON] on the enum `PropertyType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `ButtonExecution` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OnboardingProgress` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "FilterLogic" AS ENUM ('AND', 'OR');

-- AlterEnum
BEGIN;
CREATE TYPE "PropertyType_new" AS ENUM ('TEXT', 'NUMBER', 'DATE', 'CHECKBOX', 'SELECT', 'STATUS', 'RELATION', 'FORMULA', 'RATING', 'PROGRESS', 'DURATION');
ALTER TABLE "Property" ALTER COLUMN "type" TYPE "PropertyType_new" USING ("type"::text::"PropertyType_new");
ALTER TYPE "PropertyType" RENAME TO "PropertyType_old";
ALTER TYPE "PropertyType_new" RENAME TO "PropertyType";
DROP TYPE "public"."PropertyType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "ButtonExecution" DROP CONSTRAINT "ButtonExecution_recordId_fkey";

-- DropForeignKey
ALTER TABLE "OnboardingProgress" DROP CONSTRAINT "OnboardingProgress_userId_fkey";

-- AlterTable
ALTER TABLE "GoogleAccount" ALTER COLUMN "refreshToken" DROP NOT NULL,
ALTER COLUMN "tokenExpiresAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;

-- AlterTable
ALTER TABLE "View" ADD COLUMN     "filterLogic" "FilterLogic" NOT NULL DEFAULT 'AND';

-- DropTable
DROP TABLE "ButtonExecution";

-- DropTable
DROP TABLE "OnboardingProgress";
