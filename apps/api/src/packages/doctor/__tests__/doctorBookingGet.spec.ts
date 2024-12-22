import request from "supertest";
import { expect, it } from "vitest";
import { createApp } from "../../../app";
import {
    defaultFrozenKeys,
    sanitizeTestObject,
} from "../../../testUtils/sanitizeTestObject";
import { createBooking } from "../../booking/__fixtures__/createBooking";
import { createSlot } from "../../slot/__fixtures__/createSlot";
import { SLOT_REPEAT_TYPE_ENUM } from "../../slot/slotTable";
import { createDoctor } from "../__fixtures__/createDoctor";

it("should validate params and return 400", async () => {
    const app = createApp();

    const response = await request(app.listen()).get(
        `/doctors/0a523035-fcca-4bbd-a7e6-3918e4689f56/bookings?start_time=12-21T10:00:00.000Z&end_time=24T10:00:00.000Z`
    );

    const body = response.body as Record<string, unknown>;

    expect(response.status).toBe(400);

    expect(body).toMatchSnapshot();
});

it("should get bookings within the date range", async () => {
    const app = createApp();

    const doctor = await createDoctor();
    const slot = await createSlot({
        duration: 30,
        doctorId: doctor.id,
        repeatType: SLOT_REPEAT_TYPE_ENUM.WEEKLY,
        startTime: new Date("2024-12-21T10:00:00.000Z"),
        endTime: new Date("2024-12-21T12:00:00.000Z"),
        repeatWeekdays: [1, 3, 5],
    });

    await createBooking({
        time: new Date("2024-12-23T10:00:00.000Z"),
        slotId: slot.id,
    });

    await createBooking({
        time: new Date("2024-12-23T10:30:00.000Z"),
        slotId: slot.id,
    });

    await createBooking({
        time: new Date("2024-12-25T10:00:00.000Z"),
        slotId: slot.id,
    });

    const response = await request(app.listen()).get(
        `/doctors/${doctor.id}/bookings?start_time=2024-12-21T10:00:00.000Z&end_time=2024-12-25T10:00:00.000Z`
    );

    const body = response.body as Record<string, unknown>;

    expect(response.status).toBe(200);

    expect(
        sanitizeTestObject({
            obj: body,
            frozenKeys: [...defaultFrozenKeys, "slot_id"],
        })
    ).toMatchSnapshot();
});
