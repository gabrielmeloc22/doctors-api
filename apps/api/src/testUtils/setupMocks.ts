import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";

import { sql } from "drizzle-orm";
import { afterEach, beforeEach, vi } from "vitest";

vi.doMock("../database/db.ts", () => {
    const db = drizzle({ casing: "camelCase" });

    return { db };
});

beforeEach(async () => {
    const { db } = await import("../database/db");

    await migrate(db, { migrationsFolder: "./src/migrations" });
});

afterEach(async () => {
    const { db } = await import("../database/db");

    await db.execute(sql`drop schema if exists public cascade`);
    await db.execute(sql`create schema public`);
    await db.execute(sql`drop schema if exists drizzle cascade`);
});
