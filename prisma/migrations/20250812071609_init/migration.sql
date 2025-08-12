-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "confirmation_code" INTEGER,
ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone_number_verified" BOOLEAN NOT NULL DEFAULT false;
