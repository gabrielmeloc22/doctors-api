import request from "supertest";
import { beforeAll, expect, it } from "vitest";
import { createApp } from "../../../app";
import { db } from "../../../database/db";
import { mockDate } from "../../../testUtils/mockDate";
import {
    defaultFrozenKeys,
    sanitizeTestObject,
} from "../../../testUtils/sanitizeTestObject";
import { bookingTable } from "../../booking/bookingTable";
import { createDoctor } from "../../doctor/__fixtures__/createDoctor";
import { createSlot } from "../__fixtures__/createSlot";
import { SLOT_REPEAT_TYPE_ENUM } from "../slotTable";

beforeAll(() => {
    mockDate(new Date("2024-12-21T10:00:00.000Z"));
});

it("should validate params and return 400", async () => {
    const app = createApp();

    const payload = {
        reason: "checkup",
        patient_id: "some-id",
        start_time: new Date("2024-12-21T10:30:00.000Z").toISOString(),
    };

    const response = await request(app.listen())
        .post(`/slots/1/book`)
        .send(payload);

    expect(response.status).toBe(400);

    const body = response.body as Record<string, unknown>;

    expect(body).toMatchSnapshot();
});

it("should validate body and return 400", async () => {
    const app = createApp();

    const payload = {
        start_time: "",
    };

    const response = await request(app.listen())
        .post("/slots/0a523035-fcca-4bbd-a7e6-3918e4689f56/book")
        .send(payload);

    expect(response.status).toBe(400);

    const body = response.body as Record<string, unknown>;

    expect(body).toMatchSnapshot();
});

it("should validate slot id and return 404", async () => {
    const app = createApp();

    const payload = {
        reason: "checkup",
        patient_id: "some-id",
        start_time: new Date("2024-12-21T10:30:00.000Z").toISOString(),
    };

    const response = await request(app.listen())
        .post("/slots/0a523035-fcca-4bbd-a7e6-3918e4689f56/book")
        .send(payload);

    const body = response.body as Record<string, unknown>;

    expect(response.status).toBe(404);

    expect(body).toMatchObject({
        success: false,
        error: "Slot not found",
    });
});

it("should post, book a in a single slot and return 201", async () => {
    const app = createApp();

    const doctor = await createDoctor();
    const slot = await createSlot({
        duration: 30,
        doctorId: doctor.id,
        repeatType: SLOT_REPEAT_TYPE_ENUM.SINGLE,
        startTime: new Date("2024-12-21T10:00:00.000Z"),
        endTime: new Date("2024-12-21T12:00:00.000Z"),
    });

    const payload = {
        reason: "checkup",
        patient_id: "some-id",
        start_time: new Date("2024-12-21T10:30:00.000Z").toISOString(),
    };

    const response = await request(app.listen())
        .post(`/slots/${slot.id}/book`)
        .send(payload);

    const body = response.body as Record<string, unknown>;

    const bookings = await db.select().from(bookingTable);

    const [booking] = bookings;

    expect(response.status).toBe(201);

    expect(bookings).toHaveLength(1);

    expect(body).toMatchObject({
        success: true,
        booking: {
            id: booking?.id,
            patient_id: booking?.patientId,
            reason: booking?.reason,
            slot_id: booking?.slotId,
            time: booking?.time.toISOString(),
        },
    });

    expect(
        sanitizeTestObject({
            obj: body,
            frozenKeys: [...defaultFrozenKeys, "slot_id"],
        })
    ).toMatchSnapshot();
});

it("should post with unavailable date in a single slot and return 400", async () => {
    const app = createApp();

    const doctor = await createDoctor();
    const slot = await createSlot({
        duration: 30,
        doctorId: doctor.id,
        repeatType: SLOT_REPEAT_TYPE_ENUM.SINGLE,
        startTime: new Date("2024-12-21T10:00:00.000Z"),
        endTime: new Date("2024-12-21T12:00:00.000Z"),
    });

    const payload = {
        reason: "checkup",
        patient_id: "some-id",
        start_time: new Date("2024-12-20T12:00:00.000Z").toISOString(),
    };

    const response = await request(app.listen())
        .post(`/slots/${slot.id}/book`)
        .send(payload);

    const body = response.body as Record<string, unknown>;

    const bookings = await db.select().from(bookingTable);

    expect(response.status).toBe(400);

    expect(bookings).toHaveLength(0);

    expect(body).toMatchObject({
        success: false,
        error: "Booking time not available",
    });
});

it("should post, book a in a daily slot and return 201", async () => {
    const app = createApp();

    const doctor = await createDoctor();
    const slot = await createSlot({
        duration: 30,
        doctorId: doctor.id,
        repeatType: SLOT_REPEAT_TYPE_ENUM.DAILY,
        startTime: new Date("2024-12-21T10:00:00.000Z"),
        endTime: new Date("2024-12-21T12:00:00.000Z"), // 4 time slots
    });

    const payload = {
        reason: "checkup",
        patient_id: "some-id",
        start_time: new Date("2024-12-22T10:00:00.000Z").toISOString(),
    };

    const response = await request(app.listen())
        .post(`/slots/${slot.id}/book`)
        .send(payload);

    const body = response.body as Record<string, unknown>;

    const bookings = await db.select().from(bookingTable);

    const [booking] = bookings;

    expect(response.status).toBe(201);

    expect(bookings).toHaveLength(1);

    expect(body).toMatchObject({
        success: true,
        booking: {
            id: booking?.id,
            patient_id: booking?.patientId,
            reason: booking?.reason,
            slot_id: booking?.slotId,
            time: booking?.time.toISOString(),
        },
    });

    expect(
        sanitizeTestObject({
            obj: body,
            frozenKeys: [...defaultFrozenKeys, "slot_id"],
        })
    ).toMatchSnapshot();
});

it("should post with unavailable date in a daily slot and return 400", async () => {
    const app = createApp();

    const doctor = await createDoctor();
    const slot = await createSlot({
        duration: 30,
        doctorId: doctor.id,
        repeatType: SLOT_REPEAT_TYPE_ENUM.DAILY,
        startTime: new Date("2024-12-21T10:00:00.000Z"),
        endTime: new Date("2024-12-21T12:00:00.000Z"),
    });

    const payload = {
        reason: "checkup",
        patient_id: "some-id",
        start_time: new Date("2024-12-21T13:00:00.000Z").toISOString(),
    };

    const response = await request(app.listen())
        .post(`/slots/${slot.id}/book`)
        .send(payload);

    const body = response.body as Record<string, unknown>;

    const bookings = await db.select().from(bookingTable);

    expect(response.status).toBe(400);

    expect(bookings).toHaveLength(0);

    expect(body).toMatchObject({
        success: false,
        error: "Booking time not available",
    });
});

it("should post, book a in a weekly slot and return 201", async () => {
    const app = createApp();

    const doctor = await createDoctor();
    const slot = await createSlot({
        duration: 30,
        doctorId: doctor.id,
        repeatType: SLOT_REPEAT_TYPE_ENUM.WEEKLY,
        startTime: new Date("2024-12-21T10:00:00.000Z"),
        endTime: new Date("2024-12-21T12:00:00.000Z"), // 4 time slots
        repeatWeekdays: [1, 3, 5], // monday, wednesday, friday
    });

    const payload = {
        reason: "checkup",
        patient_id: "some-id",
        start_time: new Date("2024-12-23T10:00:00.000Z").toISOString(),
    };

    const response = await request(app.listen())
        .post(`/slots/${slot.id}/book`)
        .send(payload);

    const body = response.body as Record<string, unknown>;

    const bookings = await db.select().from(bookingTable);

    const [booking] = bookings;

    expect(response.status).toBe(201);

    expect(bookings).toHaveLength(1);

    expect(body).toMatchObject({
        success: true,
        booking: {
            id: booking?.id,
            patient_id: booking?.patientId,
            reason: booking?.reason,
            slot_id: booking?.slotId,
            time: booking?.time.toISOString(),
        },
    });

    expect(
        sanitizeTestObject({
            obj: body,
            frozenKeys: [...defaultFrozenKeys, "slot_id"],
        })
    ).toMatchSnapshot();
});

it("should post with unavailable date in a weekly slot and return 400", async () => {
    const app = createApp();

    const doctor = await createDoctor();
    const slot = await createSlot({
        duration: 30,
        doctorId: doctor.id,
        repeatType: SLOT_REPEAT_TYPE_ENUM.WEEKLY,
        startTime: new Date("2024-12-21T10:00:00.000Z"),
        endTime: new Date("2024-12-21T12:00:00.000Z"), // 4 time slots
        repeatWeekdays: [1, 3, 5], // monday, wednesday, friday
    });

    const payload = {
        reason: "checkup",
        patient_id: "some-id",
        start_time: new Date("2024-12-22T10:00:00.000Z").toISOString(),
    };

    const response = await request(app.listen())
        .post(`/slots/${slot.id}/book`)
        .send(payload);

    const body = response.body as Record<string, unknown>;

    const bookings = await db.select().from(bookingTable);

    expect(response.status).toBe(400);

    expect(bookings).toHaveLength(0);

    expect(body).toMatchObject({
        success: false,
        error: "Booking time not available",
    });
});

it("should post with unavailable time in a weekly slot and return 400", async () => {
    const app = createApp();

    const doctor = await createDoctor();
    const slot = await createSlot({
        duration: 30,
        doctorId: doctor.id,
        repeatType: SLOT_REPEAT_TYPE_ENUM.WEEKLY,
        startTime: new Date("2024-12-21T10:00:00.000Z"),
        endTime: new Date("2024-12-21T12:00:00.000Z"), // 4 time slots
        repeatWeekdays: [1, 3, 5], // monday, wednesday, friday
    });

    const payload = {
        reason: "checkup",
        patient_id: "some-id",
        start_time: new Date("2024-12-23T13:00:00.000Z").toISOString(),
    };

    const response = await request(app.listen())
        .post(`/slots/${slot.id}/book`)
        .send(payload);

    const body = response.body as Record<string, unknown>;

    const bookings = await db.select().from(bookingTable);

    expect(response.status).toBe(400);

    expect(bookings).toHaveLength(0);

    expect(body).toMatchObject({
        success: false,
        error: "Booking time not available",
    });
});
