import * as t from "drizzle-orm/pg-core";
import { idField, timestampField } from "../database/schemaDefaults";
import { slotTable } from "../slot/slotTable";

export const bookingTable = t.pgTable("booking", {
    slotId: t.uuid().references(() => slotTable.id),
    patientId: t.varchar({ length: 256 }).notNull(),
    reason: t.varchar({ length: 256 }).notNull(),
    bookingTime: t.varchar({ length: 256 }).notNull(),
    ...timestampField,
    ...idField,
});
