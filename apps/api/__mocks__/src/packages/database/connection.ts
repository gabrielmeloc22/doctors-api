import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle.mock({ casing: "camelCase" });
