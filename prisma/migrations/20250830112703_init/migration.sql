/*
  Warnings:

  - You are about to drop the column `amount_total` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `payment_id` on the `subscriptions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."subscriptions" DROP COLUMN "amount_total",
DROP COLUMN "currency",
DROP COLUMN "payment_id";
