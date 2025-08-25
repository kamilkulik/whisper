/*
  Warnings:

  - Added the required column `amount_total` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."subscriptions" ADD COLUMN     "amount_total" INTEGER NOT NULL,
ADD COLUMN     "currency" TEXT NOT NULL;
