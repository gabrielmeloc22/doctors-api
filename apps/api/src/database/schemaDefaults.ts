import { randomUUID } from "crypto";
import * as t from "drizzle-orm/pg-core";

export const idField = {
    id: t.uuid().primaryKey().$defaultFn(randomUUID),
};

export const timestampField = {
    createdAt: t.timestamp().notNull().defaultNow(),
    updatedAt: t
        .timestamp()
        .notNull()
        .defaultNow()
        .$defaultFn(() => new Date()),
};
