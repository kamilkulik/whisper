-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tryout_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tryout_last_sent_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "deliveries" (
    "id" SERIAL NOT NULL,
    "phone_number" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "message_number" INTEGER NOT NULL,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "feedback" (
    "id" SERIAL NOT NULL,
    "phone_number" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "feedback" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);
