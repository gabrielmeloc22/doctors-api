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
        firstName: "John",
        lastName: "Doe",
        username: "doc007",
        email: "doc@mail.com",
    };

    const response = await request(app.listen())
        .post("/doctors")
        .send(payload)
        .expect(201);

    const doctors = await db.select().from(doctorTable);
    const doctor = doctors[0];

    expect(doctors.length).toBe(1);

    expect(doctor).toMatchObject(payload);

    expect(response.body).toMatchObject({
        doctor: {
            id: doctor?.id,
            username: doctor?.username,
            firstName: doctor?.firstName,
            lastName: doctor?.lastName,
            email: doctor?.email,
        },
        success: true,
    });

    expect(
        sanitizeTestObject({ obj: doctor, frozenKeys: defaultFrozenKeys })
    ).toMatchSnapshot();
});
