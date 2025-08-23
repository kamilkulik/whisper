/*
  Warnings:

  - Added the required column `date_expires` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date_started` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_id` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PaymentProvider" AS ENUM ('STRIPE');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'PENDING', 'EXPIRED', 'FAILED', 'REFUNDED', 'PAUSED');

-- AlterTable
ALTER TABLE "public"."subscriptions" ADD COLUMN     "date_cancelled" TIMESTAMP(3),
ADD COLUMN     "date_expires" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "date_refunded" TIMESTAMP(3),
ADD COLUMN     "date_started" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "paymentProvider" "public"."PaymentProvider" NOT NULL DEFAULT 'STRIPE',
ADD COLUMN     "payment_id" TEXT NOT NULL,
ADD COLUMN     "status" "public"."SubscriptionStatus" NOT NULL;
