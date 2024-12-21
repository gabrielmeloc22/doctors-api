ALTER TABLE "booking" DROP CONSTRAINT "booking_time_unique";--> statement-breakpoint
ALTER TABLE "booking" ALTER COLUMN "time" SET DATA TYPE timestamp;