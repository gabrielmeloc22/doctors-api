import * as t from "drizzle-orm/pg-core";
import { idField, timestampField } from "../../database/schemaDefaults";

export const doctorTable = t.pgTable("doctor", {
    username: t.varchar({ length: 256 }).notNull().unique(),
    email: t.varchar({ length: 256 }).notNull().unique(),
    firstName: t.varchar({ length: 256 }).notNull(),
    lastName: t.varchar({ length: 256 }).notNull(),
    ...timestampField,
    ...idField,
});

export type IDoctor = typeof doctorTable.$inferSelect;
