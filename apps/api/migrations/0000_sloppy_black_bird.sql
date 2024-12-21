CREATE TABLE "booking" (
	"slotId" uuid,
	"patientId" varchar(256) NOT NULL,
	"reason" varchar(256) NOT NULL,
	"bookingTime" varchar(256) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doctor" (
	"username" varchar(256) NOT NULL,
	"email" varchar(256) NOT NULL,
	"firstName" varchar(256) NOT NULL,
	"lastName" varchar(256) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY NOT NULL,
	CONSTRAINT "doctor_username_unique" UNIQUE("username"),
	CONSTRAINT "doctor_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "slot" (
	"doctorId" uuid,
	"startTime" date NOT NULL,
	"endTime" date NOT NULL,
	"available" boolean,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_slotId_slot_id_fk" FOREIGN KEY ("slotId") REFERENCES "public"."slot"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slot" ADD CONSTRAINT "slot_doctorId_doctor_id_fk" FOREIGN KEY ("doctorId") REFERENCES "public"."doctor"("id") ON DELETE no action ON UPDATE no action;