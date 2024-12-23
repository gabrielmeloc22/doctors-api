import request from "supertest";
import { expect, it } from "vitest";
import { createApp } from "../../../app";
import { db } from "../../../database/db";
import {
    defaultFrozenKeys,
    sanitizeTestObject,
} from "../../../testUtils/sanitizeTestObject";
import { SLOT_REPEAT_TYPE_ENUM, slotTable } from "../../slot/slotTable";
import { createDoctor } from "../__fixtures__/createDoctor";

it("should validate params and return 400", async () => {
    const app = createApp();

    const doctor = await createDoctor();

    const payload = {
        doctor_id: doctor.id,
        start_time: new Date("2025-01-01T08:00:00.000Z"),
        end_time: new Date("2025-01-01T08:30:00.000Z"),
        duration: 30,
        repeat: {
            type: SLOT_REPEAT_TYPE_ENUM.DAILY,
            end: new Date("2025-01-01T08:00:00.000Z"),
            days: [1, 3, 5], // monday, wednesday, friday
        },
    };

    const response = await request(app.listen())
        .post("/doctors/0a523035-fcca-4bbd-a7e6-3918e4689/slots")
        .send(payload);

    const body = response.body as Record<string, unknown>;

    expect(response.status).toBe(400);

    expect(body).toMatchSnapshot();
});

it("should validate body and return 400", async () => {
    const app = createApp();

    const doctor = await createDoctor();

    const payload = {
        start_time: "",
        end_time: "",
        duration: 50,
        repeat: {
            type: "type",
            end: "",
            days: [1, 3, 5, 8],
        },
    };

    const response = await request(app.listen())
        .post(`/doctors/${doctor.id}/slots`)
        .send(payload);

    const body = response.body as Record<string, unknown>;

    expect(response.status).toBe(400);

    expect(body).toMatchSnapshot();
});

it("should post, create a new slot and return 201", async () => {
    const app = createApp();

    const doctor = await createDoctor();

    const payload = {
        doctor_id: doctor.id,
        start_time: new Date("2025-01-01T08:00:00.000Z"),
        end_time: new Date("2025-01-01T08:30:00.000Z"),
        duration: 30,
        repeat: {
            type: SLOT_REPEAT_TYPE_ENUM.DAILY,
            end: new Date("2025-01-01T08:00:00.000Z"),
            days: [1, 3, 5], // monday, wednesday, friday
        },
    };

    const response = await request(app.listen())
        .post(`/doctors/${doctor.id}/slots`)
        .send(payload);

    const slots = await db.select().from(slotTable);
    const [slot] = slots;

    const slotResult = {
        doctor_id: slot?.doctorId,
        duration: slot?.duration,
        start_time: slot?.startTime.toISOString(),
        end_time: slot?.endTime.toISOString(),
        repeat: {
            type: slot?.repeatType,
            days: slot?.repeatWeekdays,
            end: slot?.endTime.toISOString(),
        },
    };
    const body = response.body as Record<string, unknown>;

    expect(response.status).toBe(201);
    expect(slots).toHaveLength(1);

    expect(body).toMatchObject({
        success: true,
        slot: slotResult,
    });

    expect(
        sanitizeTestObject({
            obj: body,
            frozenKeys: [...defaultFrozenKeys, "doctor_id"],
        })
    ).toMatchSnapshot();
});

it("should post with slot start time greater than end time and return 400", async () => {
    const app = createApp();

    const doctor = await createDoctor();

    const payload = {
        doctor_id: doctor.id,
        start_time: new Date("2025-01-01T08:30:00.000Z"),
        end_time: new Date("2025-01-01T08:00:00.000Z"),
        duration: 30,
        repeat: {
            type: SLOT_REPEAT_TYPE_ENUM.DAILY,
            end: new Date("2025-01-01T08:00:00.000Z"),
            days: [1, 3, 5], // monday, wednesday, friday
        },
    };

    const response = await request(app.listen())
        .post(`/doctors/${doctor.id}/slots`)
        .send(payload);

    const body = response.body as Record<string, unknown>;

    expect(response.status).toBe(400);

    expect(body).toMatchObject({
        success: false,
        error: "Start time must be before end time",
    });
});

it("should post with start time and end time not divisible by duration and return 400", async () => {
    const app = createApp();

    const doctor = await createDoctor();

    const payload = {
        doctor_id: doctor.id,
        start_time: new Date("2025-01-01T08:00:00.000Z"),
        end_time: new Date("2025-01-01T08:40:00.000Z"),
        duration: 30,
        repeat: {
            type: SLOT_REPEAT_TYPE_ENUM.DAILY,
            end: new Date("2025-01-01T08:00:00.000Z"),
            days: [1, 3, 5], // monday, wednesday, friday
        },
    };

    const response = await request(app.listen())
        .post(`/doctors/${doctor.id}/slots`)
        .send(payload);

    const body = response.body as Record<string, unknown>;

    expect(response.status).toBe(400);

    expect(body).toMatchObject({
        success: false,
        error: "Invalid start and end time. Difference between start and end time must be an integer multiple of duration",
    });
});
