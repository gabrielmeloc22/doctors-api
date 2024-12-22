import { RouteConfig } from "@asteasolutions/zod-to-openapi";
import { getDay, getHours } from "date-fns";
import { and, eq } from "drizzle-orm";
import { RequestHandler } from "express";
import { z } from "zod";
import { db } from "../../database/db";
import { getResultSchema } from "../../utils/result";
import { validateRequest } from "../../utils/validateRequest";
import { bookingTable } from "../booking/bookingTable";
import { SLOT_REPEAT_TYPE_ENUM, slotTable } from "../slot/slotTable";
import { getTimeSlot } from "./lib/getTimeSlot";
import { getTimeSlots } from "./lib/getTimeSlots";

const slotBookPostParams = z.object({
    id: z.string().uuid(),
});

const slotBookPostBodySchema = z.object({
    reason: z.string(),
    patient_id: z.string(),
    start_time: z.string().datetime(),
});

const slotBookPostResult = getResultSchema({
    booking: z.object({
        id: z.string(),
        slot_id: z.string(),
        patient_id: z.string(),
        reason: z.string(),
        time: z.string(),
    }),
});

type SlotBookPostParams = z.infer<typeof slotBookPostParams>;

type SlotBookPostBody = z.infer<typeof slotBookPostBodySchema>;

type SlotBookPostResult = z.infer<typeof slotBookPostResult>;

export const slotBookPostDocs: RouteConfig = {
    method: "post",
    path: "/slots/{id}/book",
    summary: "Creates a new slot",
    request: {
        params: slotBookPostParams,
        body: {
            content: {
                "application/json": { schema: slotBookPostBodySchema },
            },
        },
    },

    responses: {
        201: {
            description: "Slot created",
            content: {
                "application/json": {
                    schema: slotBookPostResult.options[1],
                },
            },
        },
        400: {
            description: "Invalid payload",
            content: {
                "application/json": {
                    schema: slotBookPostResult.options[0],
                },
            },
        },
    },
};

const slotBookPostHandler: RequestHandler<
    SlotBookPostParams,
    SlotBookPostResult,
    SlotBookPostBody
> = async (req, res) => {
    const [slot] = await db
        .select()
        .from(slotTable)
        .where(eq(slotTable.id, req.params.id));

    if (!slot) {
        res.status(404);
        res.json({ success: false, error: "Slot not found" });
        return;
    }

    // TODO: create recurrence rule validator

    const selectedStart = new Date(req.body.start_time);

    if (selectedStart < slot.startTime) {
        res.status(400);
        res.json({ success: false, error: "Booking time not available" });
        return;
    }

    if (slot.repeatEnd && selectedStart > new Date(slot.repeatEnd)) {
        res.status(400);
        res.json({ success: false, error: "Booking time not available" });
        return;
    }

    if (
        slot.repeatType === SLOT_REPEAT_TYPE_ENUM.WEEKLY &&
        !slot.repeatWeekdays?.includes(getDay(selectedStart))
    ) {
        res.status(400);
        res.json({ success: false, error: "Booking time not available" });
        return;
    }

    if (getHours(selectedStart) > getHours(slot.endTime)) {
        res.status(400);
        res.json({ success: false, error: "Booking time not available" });
        return;
    }

    const timeSlots = getTimeSlots(slot);

    const selectedTimeSlot = getTimeSlot(slot, selectedStart);

    // check if booking time is within time slots of the day
    if (timeSlots[selectedTimeSlot] === undefined) {
        res.status(400);
        res.json({ success: false, error: "Booking time not available" });
        return;
    }

    const [existingBooking] = await db
        .select()
        .from(bookingTable)
        .where(
            and(
                eq(bookingTable.time, selectedStart),
                eq(bookingTable.slotId, slot.id)
            )
        );

    if (existingBooking) {
        res.status(400);
        res.json({ success: false, error: "Booking time already taken" });
    }

    const [booking] = await db
        .insert(bookingTable)
        .values({
            patientId: req.body.patient_id,
            reason: req.body.reason,
            time: selectedStart,
            slotId: slot.id,
        })
        .returning();

    if (!booking) {
        res.status(400);
        res.json({ success: false, error: "Error while booking time" });

        return;
    }

    res.status(201);
    res.json({
        success: true,
        booking: {
            id: booking.id,
            patient_id: booking.patientId,
            reason: booking.reason,
            slot_id: booking.slotId,
            time: booking.time.toISOString(),
        },
    });
};

export const slotBookPost: RequestHandler[] = [
    validateRequest({
        body: slotBookPostBodySchema,
        params: slotBookPostParams,
    }),
    slotBookPostHandler as RequestHandler,
];
