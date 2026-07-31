import type { db } from "../db/index.js"

export type DrizzleTx = Parameters<typeof db.transaction<unknown>>[0] extends (
  tx: infer Tx,
) => unknown
  ? Tx
  : never
