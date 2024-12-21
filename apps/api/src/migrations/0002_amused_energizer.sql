ALTER TABLE "booking" ALTER COLUMN "slotId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "slot" ALTER COLUMN "startTime" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "slot" ALTER COLUMN "endTime" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "slot" ALTER COLUMN "endTime" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "slot" ALTER COLUMN "repeatEnd" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "time" date NOT NULL;--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "bookingTime";--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_time_unique" UNIQUE("time");