import request from "supertest";
import { expect, it } from "vitest";
import { createApp } from "../../../app";
import { db } from "../../../database/db";
import {
    defaultFrozenKeys,
    sanitizeTestObject,
} from "../../../testUtils/sanitizeTestObject";
import { SLOT_REPEAT_TYPE_ENUM, slotTable } from "../../slot/slotTable";
import { createDoctor } from "../fixtures/createDoctor";

it("should post, create a new slot and return 201", async () => {
    const app = createApp();

    const doctor = await createDoctor();

    const payload = {
        doctor_id: doctor.id,
        start_time: new Date("2025-01-01T08:00:00.000Z"),
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

    const slots = await db.select().from(slotTable);
    const slot = slots[0];

    const slotResult = {
        doctor_id: slot?.doctorId,
        duration: slot?.duration,
        start_time: slot?.startTime,
        end_time: slot?.endTime,
        repeat: {
            type: slot?.repeatType,
            days: slot?.repeatWeekdays || null,
            end: slot?.endTime || null,
        },
    };
    const body = response.body as Record<string, unknown>;

    console.log({ body: JSON.stringify(body) });

    expect(response.status).toBe(201);
    expect(slots).toHaveLength(1);

    expect(body).toMatchObject({
        success: true,
        slot: slotResult,
    });

    expect(
        sanitizeTestObject({
            obj: body,
            frozenKeys: defaultFrozenKeys,
        })
    ).toMatchSnapshot();
});
