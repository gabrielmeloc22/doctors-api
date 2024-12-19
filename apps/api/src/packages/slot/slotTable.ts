import * as t from "drizzle-orm/pg-core";
import { idField, timestampField } from "../database/schemaDefaults";
import { doctorTable } from "../doctor/doctorTable";

export const slotTable = t.pgTable("slot", {
    doctorId: t.uuid().references(() => doctorTable.id),
    startTime: t.date().notNull(),
    endTime: t.date().notNull(),
    available: t.boolean(),
    ...timestampField,
    ...idField,
});
