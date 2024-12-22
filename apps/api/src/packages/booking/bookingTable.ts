import { relations } from "drizzle-orm";
import * as t from "drizzle-orm/pg-core";
import { idField, timestampField } from "../../database/schemaDefaults";
import { slotTable } from "../slot/slotTable";

export const bookingTable = t.pgTable(
    "booking",
    {
        slotId: t.uuid().notNull(),
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

export const postsRelations = relations(bookingTable, ({ one }) => ({
    slot: one(slotTable, {
        fields: [bookingTable.slotId],
        references: [slotTable.id],
    }),
}));

export type IBooking = typeof bookingTable.$inferInsert;
