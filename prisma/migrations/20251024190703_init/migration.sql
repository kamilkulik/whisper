-- CreateTable
CREATE TABLE "session_id_cache" (
    "id" SERIAL NOT NULL,
    "session_id" TEXT NOT NULL,
    "confirmation_code" INTEGER NOT NULL,
    "confirmation_code_expires" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "session_id_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "session_id_cache_session_id_key" ON "session_id_cache"("session_id");
