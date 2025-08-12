/*
  Warnings:

  - The values [SP] on the enum `SupportedLanguagesEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."SupportedLanguagesEnum_new" AS ENUM ('PL', 'EN', 'ES', 'IT');
ALTER TABLE "public"."messages" ALTER COLUMN "language" TYPE "public"."SupportedLanguagesEnum_new" USING ("language"::text::"public"."SupportedLanguagesEnum_new");
ALTER TABLE "public"."users" ALTER COLUMN "message_language" TYPE "public"."SupportedLanguagesEnum_new" USING ("message_language"::text::"public"."SupportedLanguagesEnum_new");
ALTER TYPE "public"."SupportedLanguagesEnum" RENAME TO "SupportedLanguagesEnum_old";
ALTER TYPE "public"."SupportedLanguagesEnum_new" RENAME TO "SupportedLanguagesEnum";
DROP TYPE "public"."SupportedLanguagesEnum_old";
COMMIT;
