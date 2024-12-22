import { endOfDay, getDay, getDayOfYear, startOfDay } from "date-fns";
import { and, gte, lte } from "drizzle-orm";
import { RequestHandler } from "express";
import { z } from "zod";
import { db } from "../../database/db";
import { getDatesInterval } from "../../utils/getDatesInterval";
import { Result } from "../../utils/result";
import { validateRequest } from "../../utils/validateRequest";
import { IBooking } from "../booking/bookingTable";
import { getTimeSlot } from "../slot/lib/getTimeSlot";
import { getTimeSlotDate } from "../slot/lib/getTimeSlotDate";
import { getTimeSlots } from "../slot/lib/getTimeSlots";
import { ISlot, SLOT_REPEAT_TYPE_ENUM } from "../slot/slotTable";

const doctorAvailableSlotsGetParams = z.object({
    id: z.string(),
});

type DoctorAvailableSlotsGetParams = z.infer<
    typeof doctorAvailableSlotsGetParams
>;

type DoctorAvailableSlotsGetBody = unknown;

const doctorAvailableSlotsGetQuery = z.object({
    start_time: z.string().datetime(),
    end_time: z.string().datetime(),
});

type DoctorAvailableSlotsGetQuery = z.infer<
    typeof doctorAvailableSlotsGetQuery
>;

type SlotData = {
    id: string;
    time_slot: number;
    start_time: string;
};

type SlotsAggregateData = Record<string, SlotData[]>;

type DoctorsSlotCreatePostResult = Result<{
    slots: SlotsAggregateData;
}>;

const doctorAvailableSlotsGetHandler: RequestHandler<
    DoctorAvailableSlotsGetParams,
    DoctorsSlotCreatePostResult,
    DoctorAvailableSlotsGetBody,
    DoctorAvailableSlotsGetQuery
> = async (req, res) => {
    const slots = await db.query.slotTable.findMany({
        with: {
            bookings: {
                where: (t) =>
                    and(
                        gte(t.time, startOfDay(new Date(req.query.start_time))),
                        lte(t.time, endOfDay(new Date(req.query.end_time)))
                    ),
            },
        },
    });

    const daysToCalculate = getDatesInterval(
        new Date(req.query.start_time),
        new Date(req.query.end_time)
    );

    const getAvailableTimeSlots = (
        date: Date,
        slot: ISlot & { bookings: IBooking[] }
    ): SlotData[] => {
        if (
            slot.repeatType === SLOT_REPEAT_TYPE_ENUM.SINGLE &&
            getDayOfYear(date) !== getDayOfYear(slot.startTime)
        ) {
            return [];
        }

        if (
            slot.repeatType === SLOT_REPEAT_TYPE_ENUM.WEEKLY &&
            !slot.repeatWeekdays?.includes(getDay(date))
        ) {
            return [];
        }

        const timeSlots = getTimeSlots(slot);
        const bookings = slot.bookings.filter(
            (booking) => getDayOfYear(booking.time) === getDayOfYear(date)
        );

        const availableTimeSlots: SlotData[] = [];

        for (const timeSlot of timeSlots) {
            const available = !bookings.find(
                (booking) => getTimeSlot(slot, booking.time) === timeSlot
            );

            if (!available) {
                continue;
            }

            availableTimeSlots.push({
                id: slot.id,
                time_slot: timeSlot,
                start_time: getTimeSlotDate(slot, date, timeSlot).toISOString(),
            });
        }

        return availableTimeSlots;
    };

    const slotsResult = daysToCalculate.reduce((acc, curr) => {
        const data = slots
            .map((slot) => getAvailableTimeSlots(curr, slot))
            .flat();

        data.sort((a, b) => a.start_time.localeCompare(b.start_time));

        return {
            ...acc,
            [curr.toISOString()]: data,
        };
    }, {});

    res.status(200);
    res.json({
        success: true,
        slots: slotsResult,
    });
};

export const doctorAvailableSlotsGet: RequestHandler[] = [
    validateRequest({
        params: doctorAvailableSlotsGetParams,
        query: doctorAvailableSlotsGetQuery,
    }),
    doctorAvailableSlotsGetHandler as RequestHandler,
];
