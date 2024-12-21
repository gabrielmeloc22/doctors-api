import { RequestHandler } from "express";
import { z } from "zod";
import { db } from "../../database/db";
import { OmitTimestamp } from "../../utils/omitTimestamp";
import { Result } from "../../utils/result";
import { validateRequest } from "../../utils/validateRequest";
import { doctorTable } from "./doctorTable";

type DoctorCreatePostParams = unknown;

const doctorCreatePostBodySchema = z.object({
    username: z
        .string()
        .min(5, "Username must have 5 or more characters")
        .max(128, "Username is too long"),
    email: z.string().email("Invalid email"),
    firstName: z.string().max(128, "First name is too long"),
    lastName: z.string().max(128, "Last name is too long"),
});

export type DoctorCreatePostBody = z.infer<typeof doctorCreatePostBodySchema>;

export type DoctorsCreatePostResult = Result<{
    doctor: OmitTimestamp<typeof doctorTable.$inferSelect>;
}>;

const doctorCreatePostHandler: RequestHandler<
    DoctorCreatePostParams,
    DoctorsCreatePostResult,
    DoctorCreatePostBody
> = async (req, res) => {
    const body = req.body;

    const result = await db
        .insert(doctorTable)
        .values({
            email: body.email,
            firstName: body.firstName,
            lastName: body.lastName,
            username: body.username,
        })
        .returning();

    const doctor = result[0];

    if (!doctor) {
        res.status(500);
        res.json({ success: false, error: "Error creating doctor" });

        return;
    }

    res.status(201);
    res.json({
        success: true,
        doctor: {
            email: doctor.email,
            firstName: doctor.firstName,
            lastName: doctor.lastName,
            id: doctor.id,
            username: doctor.username,
        },
    });
};

export const doctorCreatePost: RequestHandler[] = [
    validateRequest({ body: doctorCreatePostBodySchema }),
    doctorCreatePostHandler,
];
