/*
  Warnings:

  - You are about to drop the column `language` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `length` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `messages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."messages" DROP COLUMN "language",
DROP COLUMN "length",
DROP COLUMN "message";

-- CreateTable
CREATE TABLE "public"."message_translations" (
    "id" SERIAL NOT NULL,
    "message_id" INTEGER NOT NULL,
    "language" "public"."SupportedLanguagesEnum" NOT NULL,
    "text" TEXT NOT NULL,
    "length" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "message_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "message_translations_message_id_language_key" ON "public"."message_translations"("message_id", "language");

-- AddForeignKey
ALTER TABLE "public"."message_translations" ADD CONSTRAINT "message_translations_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
