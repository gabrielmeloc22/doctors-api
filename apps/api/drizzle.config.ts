import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "postgresql",
    schema: "./src/packages/**/*Table.ts",
    dbCredentials: { url: process.env.DATABASE_URL },
    out: "./src/migrations",
});
