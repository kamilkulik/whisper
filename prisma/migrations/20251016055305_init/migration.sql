/*
  Warnings:

  - A unique constraint covering the columns `[event_id]` on the table `webhook_event_log` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `event_type` to the `webhook_event_log` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."webhook_event_log" ADD COLUMN     "event_type" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "webhook_event_log_event_id_key" ON "public"."webhook_event_log"("event_id");
