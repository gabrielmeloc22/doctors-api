import { RouteConfig } from "@asteasolutions/zod-to-openapi";
import { eq, or } from "drizzle-orm";
import { RequestHandler } from "express";
import { z } from "zod";
import { db } from "../../database/db";
import { getResultSchema } from "../../utils/result";
import { validateRequest } from "../../utils/validateRequest";
import { doctorTable } from "./doctorTable";

type DoctorCreatePostParams = unknown;

const doctorCreatePostBodySchema = z.object({
    username: z
        .string()
        .min(5, "Username must have 5 or more characters")
        .max(128, "Username is too long"),
    email: z.string().email("Invalid email"),
    first_name: z.string().max(128, "First name is too long"),
    last_name: z.string().max(128, "Last name is too long"),
});

const doctorsSlotCreatePostResult = getResultSchema({
    doctor: z.object({
        id: z.string(),
        username: z.string(),
        email: z.string(),
        first_name: z.string(),
        last_name: z.string(),
    }),
});

export type DoctorCreatePostBody = z.infer<typeof doctorCreatePostBodySchema>;

export type DoctorsCreatePostResult = z.infer<
    typeof doctorsSlotCreatePostResult
>;

export const doctorPostDocs: RouteConfig = {
    method: "post",
    path: "/doctors",
    summary: "Creates a new doctor",
    request: {
        body: {
            content: {
                "application/json": { schema: doctorCreatePostBodySchema },
            },
        },
    },

    responses: {
        201: {
            description: "Doctor created",
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

const doctorCreatePostHandler: RequestHandler<
    DoctorCreatePostParams,
    DoctorsCreatePostResult,
    DoctorCreatePostBody
> = async (req, res) => {
    const body = req.body;

    const [existingDoctor] = await db
        .select()
        .from(doctorTable)
        .where(
            or(
                eq(doctorTable.username, req.body.username),
                eq(doctorTable.email, req.body.email)
            )
        );

    if (existingDoctor) {
        res.status(400);
        res.json({
            success: false,
            error: "Doctor already exists",
        });

        return;
    }

    const result = await db
        .insert(doctorTable)
        .values({
            email: body.email,
            firstName: body.first_name,
            lastName: body.last_name,
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
            first_name: doctor.firstName,
            last_name: doctor.lastName,
            id: doctor.id,
            username: doctor.username,
        },
    });
};

export const doctorPost: RequestHandler[] = [
    validateRequest({ body: doctorCreatePostBodySchema }),
    doctorCreatePostHandler,
];
