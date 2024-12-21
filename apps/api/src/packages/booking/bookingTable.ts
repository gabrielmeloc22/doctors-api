import * as t from "drizzle-orm/pg-core";
import { idField, timestampField } from "../../database/schemaDefaults";
import { slotTable } from "../slot/slotTable";

export const bookingTable = t.pgTable(
    "booking",
    {
        slotId: t
            .uuid()
            .references(() => slotTable.id)
            .notNull(),
        patientId: t.varchar({ length: 256 }).notNull(),
        reason: t.varchar({ length: 256 }).notNull(),
        time: t.timestamp().notNull(),
        ...timestampField,
        ...idField,
    },
    (table) => [
        {
            slot_id_time_unique: t.unique().on(table.id, table.time),
        },
    ]
);
