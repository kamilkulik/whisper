/*
  Warnings:

  - Added the required column `encoding` to the `message_translations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parts` to the `message_translations` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MessageEncodingEnum" AS ENUM ('UCS2', 'GSM7');

-- AlterTable
ALTER TABLE "message_translations" ADD COLUMN     "encoding" "MessageEncodingEnum" NOT NULL,
ADD COLUMN     "parts" INTEGER NOT NULL;
