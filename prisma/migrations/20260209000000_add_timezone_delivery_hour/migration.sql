-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'Europe/Warsaw';
ALTER TABLE "public"."users" ADD COLUMN "delivery_hour" INTEGER NOT NULL DEFAULT 20;
