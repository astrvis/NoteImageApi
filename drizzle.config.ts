import "dotenv/config"
import { defineConfig, type Config } from "drizzle-kit"

let config: Config
if (process.env.NODE_ENV === "development") {
  config = {
    out: "./drizzle-local",
    dialect: "sqlite", //turso
    schema: "./src/db/schema.ts",
    dbCredentials: {
      url: "./src/db/note.db",
    },
  }
} else {
  config = {
    out: "./drizzle-turso",
    dialect: "turso",
    schema: "./src/db/schema.ts",
    dbCredentials: {
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    },
  }
}
// console.log(config)
export default defineConfig(config)
