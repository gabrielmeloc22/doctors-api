import { RouteConfig } from "@asteasolutions/zod-to-openapi";
import { eq } from "drizzle-orm";
import { RequestHandler } from "express";
import { z } from "zod";
import { db } from "../../database/db";
import { getResultSchema } from "../../utils/result";
import { validateRequest } from "../../utils/validateRequest";
import { ValueOf } from "../../utils/valueOf";
import { SLOT_REPEAT_TYPE_ENUM, slotTable } from "../slot/slotTable";
import { doctorTable } from "./doctorTable";

const doctorSlotPostParams = z.object({
    id: z.string().uuid(),
});

const doctorSlotPostBodySchema = z.object({
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

const doctorSlotPostResult = getResultSchema({
    slot: z.object({
        doctor_id: z.string(),
        start_time: z.string(),
        end_time: z.string().nullable(),
        duration: z.number(),
        repeat: z.object({
            type: z.string(),
            end: z.string().nullable(),
            days: z.array(z.number()).nullable(),
        }),
    }),
});

type DoctorSlotPostParams = z.infer<typeof doctorSlotPostParams>;

type DoctorSlotPostBody = z.infer<typeof doctorSlotPostBodySchema>;

type DoctorsSlotCreatePostResult = z.infer<typeof doctorSlotPostResult>;

export const doctorSlotPostsDocs: RouteConfig = {
    method: "post",
    path: "/doctors/{id}/slots",
    summary: "Creates a new slot",
    request: {
        params: doctorSlotPostParams,
        body: {
            content: {
                "application/json": { schema: doctorSlotPostBodySchema },
            },
        },
    },

    responses: {
        201: {
            description: "Slot created",
            content: {
                "application/json": {
                    schema: doctorSlotPostResult.options[1],
                },
            },
        },
        400: {
            description: "Invalid payload",
            content: {
                "application/json": {
                    schema: doctorSlotPostResult.options[0],
                },
            },
        },
    },
};

const doctorSlotPostHandler: RequestHandler<
    DoctorSlotPostParams,
    DoctorsSlotCreatePostResult,
    DoctorSlotPostBody
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

export const doctorSlotPost: RequestHandler[] = [
    validateRequest({
        body: doctorSlotPostBodySchema,
        params: doctorSlotPostParams,
    }),
    doctorSlotPostHandler as RequestHandler,
];
