import { eq } from "drizzle-orm";
import { RequestHandler } from "express";
import { z } from "zod";
import { db } from "../../database/db";
import { Result } from "../../utils/result";
import { validateRequest } from "../../utils/validateRequest";
import { ValueOf } from "../../utils/valueOf";
import { SLOT_REPEAT_TYPE_ENUM, slotTable } from "../slot/slotTable";
import { doctorTable } from "./doctorTable";

const doctorSlotCreatePostParams = z.object({
    id: z.string(),
});

type DoctorSlotCreatePostParams = z.infer<typeof doctorSlotCreatePostParams>;

const doctorSlotCreatePostBodySchema = z.object({
    start_time: z.string().datetime(),
    end_time: z.string().datetime(),
    duration: z.union([z.literal(30), z.literal(15)]),
    repeat: z
        .union([
            z.object({
                type: z.literal("SINGLE"),
            }),
            z.object({
                type: z.literal("WEEKLY"),
                days: z.array(z.number().max(6)),
                end: z.string().datetime(),
            }),
            z.object({
                type: z.literal("DAILY"),
                end: z.string().datetime(),
            }),
        ])
        .optional(),
});

type DoctorSlotCreatePostBody = z.infer<typeof doctorSlotCreatePostBodySchema>;

type DoctorsSlotCreatePostResult = Result<{
    slot: {
        doctor_id: string;
        start_time: string;
        end_time: string | null;
        duration: number;
        repeat: { type: string; end: string | null; days: number[] | null };
    };
}>;

const doctorSlotCreatePostHandler: RequestHandler<
    DoctorSlotCreatePostParams,
    DoctorsSlotCreatePostResult,
    DoctorSlotCreatePostBody
> = async (req, res) => {
    const body = req.body;

    const [doctor] = await db
        .select()
        .from(doctorTable)
        .where(eq(doctorTable.id, req.params.id));

    if (!doctor) {
        res.status(404);
        res.json({
            success: false,
            error: "Doctor not found",
        });

        return;
    }

    const getRepeatEnd = (): { repeatEnd?: Date } => {
        if (body.repeat?.type === SLOT_REPEAT_TYPE_ENUM.DAILY) {
            return { repeatEnd: new Date(body.repeat.end) };
        }

        if (body.repeat?.type === SLOT_REPEAT_TYPE_ENUM.WEEKLY) {
            return { repeatEnd: new Date(body.repeat.end) };
        }

        return {};
    };

    const getRepeatWeekdays = (): { repeatWeekdays?: number[] } => {
        if (body.repeat?.type === SLOT_REPEAT_TYPE_ENUM.WEEKLY) {
            return { repeatWeekdays: body.repeat.days };
        }

        return {};
    };

    const getRepeatType = (): {
        repeatType: ValueOf<typeof SLOT_REPEAT_TYPE_ENUM>;
    } => {
        if (!body.repeat) {
            return { repeatType: SLOT_REPEAT_TYPE_ENUM.SINGLE };
        }

        return { repeatType: body.repeat.type };
    };

    const [slot] = await db
        .insert(slotTable)
        .values({
            doctorId: doctor.id,
            startTime: new Date(body.start_time),
            endTime: new Date(body.end_time),
            duration: body.duration,
            ...getRepeatType(),
            ...getRepeatEnd(),
            ...getRepeatWeekdays(),
        })
        .returning();

    if (!slot) {
        res.json({ success: false, error: "Error creating slot" });
        return;
    }

    res.status(201);
    res.json({
        success: true,
        slot: {
            doctor_id: slot.doctorId,
            duration: slot.duration,
            start_time: slot.startTime.toISOString(),
            end_time: slot.endTime.toISOString(),
            repeat: {
                type: slot.repeatType,
                days: slot.repeatWeekdays,
                end: slot.endTime.toISOString(),
            },
        },
    });
};

export const doctorSlotCreatePost: RequestHandler[] = [
    validateRequest({
        body: doctorSlotCreatePostBodySchema,
        params: doctorSlotCreatePostParams,
    }),
    doctorSlotCreatePostHandler as RequestHandler,
];
