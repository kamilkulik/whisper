/*
  Warnings:

  - You are about to drop the column `payment_id` on the `subscriptions` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "public"."SubscriptionType" ADD VALUE 'TRIAL';

-- AlterTable
ALTER TABLE "public"."subscriptions" DROP COLUMN "payment_id";
