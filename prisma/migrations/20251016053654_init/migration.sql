/*
  Warnings:

  - You are about to drop the column `event_id` on the `subscriptions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."subscriptions" DROP COLUMN "event_id";

-- CreateTable
CREATE TABLE "public"."webhook_event_log" (
    "id" SERIAL NOT NULL,
    "event_id" TEXT NOT NULL,
    "event_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "webhook_event_log_pkey" PRIMARY KEY ("id")
);
