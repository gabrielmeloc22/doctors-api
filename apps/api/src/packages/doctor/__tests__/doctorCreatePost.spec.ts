import request from "supertest";
import { expect, it } from "vitest";
import { createApp } from "../../../app";
import { db } from "../../../database/db";
import {
    defaultFrozenKeys,
    sanitizeTestObject,
} from "../../../testUtils/sanitizeTestObject";
import { doctorTable } from "../doctorTable";

it("should post, create a new doctor and return 201", async () => {
    const app = createApp();

    const payload = {
        first_name: "John",
        last_name: "Doe",
        username: "doc007",
        email: "doc@mail.com",
    };

    const response = await request(app.listen())
        .post("/doctors")
        .send(payload)
        .expect(201);

    const doctors = await db.select().from(doctorTable);
    const doctor = doctors[0];

    const doctorResult = {
        id: doctor?.id,
        username: doctor?.username,
        first_name: doctor?.firstName,
        last_name: doctor?.lastName,
        email: doctor?.email,
    };

    const body = response.body as Record<string, unknown>;

    expect(doctors.length).toBe(1);

    expect(doctorResult).toMatchObject(payload);

    expect(body).toMatchObject({
        doctor: doctorResult,
        success: true,
    });

    expect(
        sanitizeTestObject({
            obj: body,
            frozenKeys: defaultFrozenKeys,
        })
    ).toMatchSnapshot();
});
