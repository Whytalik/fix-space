-- AlterEnum
BEGIN;
CREATE TYPE "IntegrationService_new" AS ENUM ('BINANCE', 'METATRADER5');
ALTER TABLE "IntegrationConnection" ALTER COLUMN "service" TYPE "IntegrationService_new" USING ("service"::text::"IntegrationService_new");
ALTER TYPE "IntegrationService" RENAME TO "IntegrationService_old";
ALTER TYPE "IntegrationService_new" RENAME TO "IntegrationService";
DROP TYPE "public"."IntegrationService_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('INFO', 'ERROR', 'AUTOMATION', 'INTEGRATION');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "ContentBlockLibrary" DROP CONSTRAINT "ContentBlockLibrary_userId_fkey";

-- AlterTable
ALTER TABLE "IntegrationConnection" ADD COLUMN     "config" JSONB;

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "isRequired";

-- DropTable
DROP TABLE "ContentBlockLibrary";
