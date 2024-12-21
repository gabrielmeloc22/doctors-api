import { and, asc, eq, gte, lte, or } from "drizzle-orm";
import { RequestHandler } from "express";
import { z } from "zod";
import { db } from "../../database/db";
import { Result } from "../../utils/result";
import { validateRequest } from "../../utils/validateRequest";
import { slotTable } from "../slot/slotTable";

const doctorAvailableSlotsGetParams = z.object({
    id: z.string(),
});

type DoctorAvailableSlotsGetParams = z.infer<
    typeof doctorAvailableSlotsGetParams
>;

type DoctorAvailableSlotsGetBody = unknown;

const doctorAvailableSlotsGetQuery = z.object({
    start_time: z.string().date(),
    end_time: z.string().date(),
});

type DoctorAvailableSlotsGetQuery = z.infer<
    typeof doctorAvailableSlotsGetQuery
>;

type DoctorsSlotCreatePostResult = Result<{
    slots: {
        doctor_id: string;
        start_time: string;
        end_time: string;
        duration: number;
        repeat: { type: string; end: string | null; days: number[] | null };
    }[];
}>;

const doctorAvailableSlotsGetHandler: RequestHandler<
    DoctorAvailableSlotsGetParams,
    DoctorsSlotCreatePostResult,
    DoctorAvailableSlotsGetBody,
    DoctorAvailableSlotsGetQuery
> = async (req, res) => {
    const slots = await db
        .select()
        .from(slotTable)
        .where(
            and(
                eq(slotTable.doctorId, req.params.id),
                gte(slotTable.startTime, new Date(req.query.start_time)),
                or(
                    lte(slotTable.endTime, new Date(req.query.end_time)),
                    lte(slotTable.repeatEnd, new Date(req.query.end_time))
                )
            )
        )
        .orderBy(asc(slotTable.startTime));

    res.status(201);
    res.json({
        success: true,
        slots: slots.map((slot) => ({
            id: slot.id,
            duration: slot.duration,
            doctor_id: slot.doctorId,
            end_time: slot.endTime.toISOString(),
            start_time: slot.startTime.toISOString(),
            repeat: {
                days: slot.repeatWeekdays,
                end: slot.repeatEnd?.toISOString() || null,
                type: slot.repeatType,
            },
        })),
    });
};

export const doctorAvailableSlotsGet: RequestHandler[] = [
    validateRequest({
        params: doctorAvailableSlotsGetParams,
        query: doctorAvailableSlotsGetQuery,
    }),
    doctorAvailableSlotsGetHandler as RequestHandler,
];
