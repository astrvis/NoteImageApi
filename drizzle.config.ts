import { defineConfig } from "drizzle-kit"

export default defineConfig({
  out: "./drizzle",
  dialect: "sqlite", //turso
  // dialect: "turso",
  schema: "./src/db/schema.ts",
  // driver: "@libsql/client",
  dbCredentials: {
    url: "./src/db/note.db",
    // url: process.env.TURSO_DATABASE_URL as string,
    // authToken: process.env.TURSO_AUTH_TOKEN as string,
  },
})
