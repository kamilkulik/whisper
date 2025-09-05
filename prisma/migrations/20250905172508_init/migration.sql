/*
  Warnings:

  - The values [CANCELLED] on the enum `SubscriptionStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."SubscriptionStatus_new" AS ENUM ('ACTIVE', 'CANCEL_AT_PERIOD_END', 'PENDING', 'EXPIRED', 'FAILED', 'REFUNDED', 'PAUSED');
ALTER TABLE "public"."subscriptions" ALTER COLUMN "status" TYPE "public"."SubscriptionStatus_new" USING ("status"::text::"public"."SubscriptionStatus_new");
ALTER TYPE "public"."SubscriptionStatus" RENAME TO "SubscriptionStatus_old";
ALTER TYPE "public"."SubscriptionStatus_new" RENAME TO "SubscriptionStatus";
DROP TYPE "public"."SubscriptionStatus_old";
COMMIT;
