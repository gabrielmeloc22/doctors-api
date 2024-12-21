import { and, eq, gte, lte } from "drizzle-orm";
import { RequestHandler } from "express";
import { z } from "zod";
import { db } from "../../database/db";
import { Result } from "../../utils/result";
import { validateRequest } from "../../utils/validateRequest";
import { bookingTable } from "../booking/bookingTable";
import { slotTable } from "../slot/slotTable";

const doctorBookingGetParams = z.object({
    id: z.string(),
});

type DoctorBookingGetParams = z.infer<typeof doctorBookingGetParams>;

type DoctorBookingGetBody = unknown;

const doctorBookingGetQuery = z.object({
    start_time: z.string().date(),
    end_time: z.string().date(),
});

type DoctorBookingGetQuery = z.infer<typeof doctorBookingGetQuery>;

type DoctorsSlotCreatePostResult = Result<{
    bookings: {
        id: string;
        slot_id: string;
        patient_id: string;
        reason: string;
        time: string;
    }[];
}>;

const doctorBookingGetHandler: RequestHandler<
    DoctorBookingGetParams,
    DoctorsSlotCreatePostResult,
    DoctorBookingGetBody,
    DoctorBookingGetQuery
> = async (req, res) => {
    const slots = db
        .select()
        .from(slotTable)
        .where(eq(slotTable.doctorId, req.params.id))
        .as("slots");

    const bookings = await db
        .select()
        .from(bookingTable)
        .innerJoin(
            slots,
            and(
                gte(bookingTable.time, new Date(req.query.start_time)),
                lte(bookingTable.time, new Date(req.query.end_time)),
                eq(bookingTable.slotId, slots.id)
            )
        );

    res.status(201);
    res.json({
        success: true,
        bookings: bookings.map(({ booking }) => ({
            id: booking.id,
            patient_id: booking.patientId,
            reason: booking.reason,
            slot_id: booking.slotId,
            time: booking.time.toISOString(),
        })),
    });
};

export const doctorBookingGet: RequestHandler[] = [
    validateRequest({
        params: doctorBookingGetParams,
        query: doctorBookingGetQuery,
    }),
    doctorBookingGetHandler as RequestHandler,
];
