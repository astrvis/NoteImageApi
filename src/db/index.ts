import type { Config } from "@libsql/client/node"
import { createClient } from "@libsql/client/node"

import "dotenv/config"
import { drizzle } from "drizzle-orm/libsql"
import * as schema from "./schema.js"
const IS_DEV = process.env.NODE_ENV === "development"

const DB_PATH = "file:./src/db/note.db"
const url = IS_DEV ? DB_PATH : (process.env.TURSO_DATABASE_URL as string)

if (!IS_DEV && !url) {
  throw new Error("【启动阻断】生产环境必须配置 TURSO_DATABASE_URL 环境变量（libsql:// 协议）")
}
const authToken = IS_DEV ? "" : (process.env.TURSO_AUTH_TOKEN as string)

const options: Config = { url, authToken }

export const sqlite = createClient(options)

export const db = drizzle(sqlite, { schema })

export { schema }
