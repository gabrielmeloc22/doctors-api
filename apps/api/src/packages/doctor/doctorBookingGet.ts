import { RouteConfig } from "@asteasolutions/zod-to-openapi";
import { and, eq, gte, lte } from "drizzle-orm";
import { RequestHandler } from "express";
import { z } from "zod";
import { db } from "../../database/db";
import { getResultSchema } from "../../utils/result";
import { validateRequest } from "../../utils/validateRequest";
import { bookingTable } from "../booking/bookingTable";
import { slotTable } from "../slot/slotTable";

const doctorBookingGetParams = z.object({
    id: z.string().uuid(),
});

const doctorBookingGetQuery = z.object({
    start_time: z.string().datetime(),
    end_time: z.string().datetime(),
});

const doctorsSlotCreatePostResult = getResultSchema({
    bookings: z.array(
        z.object({
            id: z.string(),
            slot_id: z.string(),
            patient_id: z.string(),
            reason: z.string(),
            time: z.string(),
        })
    ),
});

export const doctorBookingGetDocs: RouteConfig = {
    method: "get",
    path: "/doctors/{id}/bookings",
    summary: "Returns all bookings for a doctor",
    request: {
        params: doctorBookingGetParams,
        query: doctorBookingGetQuery,
    },

    responses: {
        200: {
            description: "Successful response",
            content: {
                "application/json": {
                    schema: doctorsSlotCreatePostResult.options[1],
                },
            },
        },
        400: {
            description: "Invalid payload",
            content: {
                "application/json": {
                    schema: doctorsSlotCreatePostResult.options[0],
                },
            },
        },
    },
};

type DoctorBookingGetBody = unknown;

type DoctorBookingGetParams = z.infer<typeof doctorBookingGetParams>;

type DoctorBookingGetQuery = z.infer<typeof doctorBookingGetQuery>;

type DoctorsSlotCreatePostResult = z.infer<typeof doctorsSlotCreatePostResult>;

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

    res.status(200);
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
