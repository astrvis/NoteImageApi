import { count, desc, eq, getTableColumns } from "drizzle-orm"
import { db } from "../db/index.js"
import { images, imagesCategory, type ImagesCategoriesInsert } from "../db/schema.js"
import type { DrizzleTx } from "./types.js"

export const addDbImageCategory = async (formData: ImagesCategoriesInsert, tx?: DrizzleTx) => {
  const DBTx = (tx ?? db) as typeof db
  const [imagesCategoryResult] = await DBTx.insert(imagesCategory)
    .values(formData)
    .returning({
      id: imagesCategory.id,
    })
    .onConflictDoNothing()

  return imagesCategoryResult
}

export const updateDbImageCategory = async (
  id: number,
  formData: Partial<ImagesCategoriesInsert>,
  tx?: DrizzleTx,
) => {
  const DBTx = (tx ?? db) as typeof db
  const [imagesCategoryResult] = await DBTx.update(imagesCategory)
    .set(formData)
    .where(eq(imagesCategory.id, id))
    .returning({
      ...getTableColumns(imagesCategory),
    })
  return imagesCategoryResult
}

export const deleteDbImageCategory = async (id: number, tx?: DrizzleTx) => {
  const DBTx = (tx ?? db) as typeof db
  const [imagesCategoryResult] = await DBTx.delete(imagesCategory)
    .where(eq(imagesCategory.id, id))
    .returning({
      id: imagesCategory.id,
    })
  return imagesCategoryResult
}

export const getDbImageCategoryById = async (id: number, tx?: DrizzleTx) => {
  const DBTx = (tx ?? db) as typeof db
  const imagesCategoryResult = await DBTx.query.imagesCategory.findFirst({
    where: eq(imagesCategory.id, id),
  })
  return imagesCategoryResult
}

export const getDbAllImageCategory = async (page: number, pageSize: number, tx?: DrizzleTx) => {
  const DBTx = (tx ?? db) as typeof db
  const [list, total] = await Promise.all([
    DBTx.query.imagesCategory.findMany({
      offset: (page - 1) * pageSize,
      limit: pageSize,
      orderBy: desc(imagesCategory.createDate),
    }),
    DBTx.select({ count: count() }).from(imagesCategory),
  ])
  return { list, total: total[0].count }
}

export const getDbAllImagesByCategoryId = async (
  categoryId: number,
  page: number,
  pageSize: number,
  tx?: DrizzleTx,
) => {
  const DBTx = (tx ?? db) as typeof db
  const [list, total] = await Promise.all([
    DBTx.query.images.findMany({
      where: eq(images.categoryId, categoryId),
      offset: (page - 1) * pageSize,
      limit: pageSize,
      orderBy: desc(images.createDate),
    }),
    DBTx.select({ count: count() }).from(images).where(eq(images.categoryId, categoryId)),
  ])
  return { list, total: total[0].count }
}
