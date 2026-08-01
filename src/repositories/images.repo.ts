import { count, desc, eq, getTableColumns, or } from "drizzle-orm"
import { db } from "../db/index.js"
import { images, type ImagesInsert, type ImagesSelect } from "../db/schema.js"
import type { DrizzleTx } from "./types.js"

export const addDbImage = async (formData: ImagesInsert, tx?: DrizzleTx): Promise<ImagesSelect> => {
  const DBTx = (tx ?? db) as typeof db
  const [list] = await DBTx.insert(images)
    .values(formData)
    .returning({
      ...getTableColumns(images),
    })
    .onConflictDoNothing()

  return list
}

export const deleteDbImage = async (id: number, tx?: DrizzleTx): Promise<{ id: number }> => {
  const DBTx = (tx ?? db) as typeof db
  const [list] = await DBTx.delete(images).where(eq(images.id, id)).returning({
    id: images.id,
  })
  return list
}

export const updateDbImage = async (
  id: number,
  formData: Partial<ImagesInsert>,
  tx?: DrizzleTx,
): Promise<ImagesSelect | undefined> => {
  const DBTx = (tx ?? db) as typeof db
  const [list] = await DBTx.update(images)
    .set(formData)
    .where(eq(images.id, id))
    .returning({
      ...getTableColumns(images),
    })
  return list
}

export const getDbImages = async (
  page: number,
  pageSize: number,
  tx?: DrizzleTx,
): Promise<{ list: ImagesSelect[]; total: number }> => {
  const DBTx = (tx ?? db) as typeof db
  const [list, total] = await Promise.all([
    DBTx.query.images.findMany({
      orderBy: desc(images.createDate),
      offset: (page - 1) * pageSize,
      limit: pageSize,
    }),
    DBTx.select({ count: count() }).from(images),
  ])
  return { list, total: total[0].count }
}

export const getDbImageBySha = async (
  sha: string,
  tx?: DrizzleTx,
): Promise<ImagesSelect | undefined> => {
  const DBTx = (tx ?? db) as typeof db
  const list = await DBTx.query.images.findFirst({
    where: or(eq(images.sha, sha), eq(images.thumbnailSha, sha)),
  })
  return list
}

export const getDbImageById = async (
  id: number,
  tx?: DrizzleTx,
): Promise<ImagesSelect | undefined> => {
  const DBTx = (tx ?? db) as typeof db
  const list = await DBTx.query.images.findFirst({
    where: eq(images.id, id),
  })
  return list
}
