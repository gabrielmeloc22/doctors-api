import { drizzle } from "drizzle-orm/node-postgres";
import * as booking from "../packages/booking/bookingTable";
import * as doctor from "../packages/doctor/doctorTable";
import * as slot from "../packages/slot/slotTable";

export const schema = {
    ...slot,
    ...doctor,
    ...booking,
};

export const db = drizzle({
    connection: process.env.DATABASE_URL,
    casing: "camelCase",
    schema,
});
