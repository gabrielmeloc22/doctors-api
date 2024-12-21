import * as t from "drizzle-orm/pg-core";
import { idField, timestampField } from "../../database/schemaDefaults";
import { doctorTable } from "../doctor/doctorTable";

export const slotRepeatTypeEnum = t.pgEnum("slot_repeat_type", [
    "WEEKLY",
    "DAILY",
    "SINGLE",
]);

export const SLOT_REPEAT_TYPE_ENUM = {
    WEEKLY: "WEEKLY",
    DAILY: "DAILY",
    SINGLE: "SINGLE",
} as const;

export const slotTable = t.pgTable("slot", {
    doctorId: t
        .uuid()
        .references(() => doctorTable.id)
        .notNull(),
    startTime: t.timestamp().notNull(),
    endTime: t.timestamp().notNull(),
    duration: t.integer().notNull(),
    repeatType: slotRepeatTypeEnum().notNull(),
    repeatWeekdays: t.integer().array(),
    repeatEnd: t.timestamp(),
    ...timestampField,
    ...idField,
});

export type ISlot = typeof slotTable.$inferSelect;
