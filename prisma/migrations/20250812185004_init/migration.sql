/*
  Warnings:

  - Added the required column `language` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `message_language` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."SupportedLanguagesEnum" AS ENUM ('PL', 'EN', 'SP', 'IT');

-- AlterTable
ALTER TABLE "public"."messages" ADD COLUMN     "language" "public"."SupportedLanguagesEnum" NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "message_language" "public"."SupportedLanguagesEnum" NOT NULL;
