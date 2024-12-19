import { RequestHandler } from "express";
import { z } from "zod";
import { Result } from "../../utils/result";
import { validateRequest } from "../../utils/validateRequest";
import { db } from "../database/connection";
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

type DoctorCreatePostBody = z.infer<typeof doctorCreatePostBodySchema>;

type DoctorsCreatePostResult = Result<{
    doctor: typeof doctorTable.$inferSelect;
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
    res.json({ success: true, doctor });
};

export const doctorCreatePost: RequestHandler[] = [
    validateRequest({ body: doctorCreatePostBodySchema }),
    doctorCreatePostHandler,
];
