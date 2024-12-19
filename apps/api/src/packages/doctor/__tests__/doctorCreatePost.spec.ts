import request from "supertest";
import { beforeAll, expect, it, vi } from "vitest";
import { createApp } from "../../../app";
import {
    defaultFrozenKeys,
    sanitizeTestObject,
} from "../../../utils/test/sanitizeTestObject";
import { db } from "../../database/connection";
import { doctorTable } from "../doctorTable";

beforeAll(() => {
    vi.mock("./src/");
});

it("should post, create a new doctor and return 201", async () => {
    const app = createApp();

    const payload = {
        firstName: "John",
        lastName: "Doe",
        username: "doc007",
        email: "doc@mail.com",
    };

    request(app).post("/doctors").send(payload).expect(201);

    const doctors = await db.select().from(doctorTable);
    const doctor = doctors[0];

    expect(doctors.length).toBe(1);
    expect(doctor).toContain(payload);
    expect(
        sanitizeTestObject({ obj: doctor, frozenKeys: defaultFrozenKeys })
    ).toMatchSnapshot();
});
