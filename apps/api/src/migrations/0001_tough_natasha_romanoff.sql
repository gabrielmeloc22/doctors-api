CREATE TYPE "public"."slot_repeat_type" AS ENUM('WEEKLY', 'DAILY', 'SINGLE');--> statement-breakpoint
ALTER TABLE "slot" ALTER COLUMN "doctorId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "slot" ALTER COLUMN "endTime" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "slot" ADD COLUMN "duration" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "slot" ADD COLUMN "repeatType" "slot_repeat_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "slot" ADD COLUMN "repeatWeekdays" integer[];--> statement-breakpoint
ALTER TABLE "slot" ADD COLUMN "repeatEnd" date;--> statement-breakpoint
ALTER TABLE "slot" DROP COLUMN "available";