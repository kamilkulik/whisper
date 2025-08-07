-- AlterTable
ALTER TABLE "public"."messages" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "updated_at" DROP NOT NULL;
