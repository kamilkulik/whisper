-- CreateTable
CREATE TABLE "public"."messages" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "length" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "phone_number" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trial_ends" TIMESTAMP(3),
    "premium" BOOLEAN NOT NULL DEFAULT false,
    "last_used_message" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "public"."users"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_last_used_message_fkey" FOREIGN KEY ("last_used_message") REFERENCES "public"."messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
