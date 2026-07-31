import type { RouteHandler } from "@hono/zod-openapi"
import { AppError } from "../errors/app-error.js"
import {
  addDbImageCategory,
  deleteDbImageCategory,
  getDbAllImageCategory,
  getDbAllImagesByCategoryId,
  updateDbImageCategory,
} from "../repositories/images.categories.repo.js"
import type {
  addImageCategoryRoute,
  deleteImageCategoryRoute,
  getAllImageCategoryRoute,
  getImageCategoryByIdRoute,
  updateImageCategoryRoute,
} from "../routes/definition/images.categories.definition.js"
import { imagesCache, imagesCategoriesCache } from "../utils/lruCache.js"

export const addImageCategory: RouteHandler<typeof addImageCategoryRoute> = async (c) => {
  const { name } = c.req.valid("json")
  const formData = {
    name,
    createDate: Date.now(),
    updateDate: Date.now(),
  }
  const result = await addDbImageCategory(formData)
  if (!result) throw new AppError(409, "图片分类名称已存在")

  return c.json({
    success: true,
    list: {
      id: result.id,
      name,
      createDate: Date.now(),
      updateDate: Date.now(),
    },
  })
}

export const updateImageCategoryById: RouteHandler<typeof updateImageCategoryRoute> = async (c) => {
  const { id } = c.req.valid("param")
  const { name } = c.req.valid("json")
  const formData = {
    id,
    name,
    updateDate: Date.now(),
  }
  const result = await updateDbImageCategory(id, formData)
  if (!result) throw new AppError(404, "图片分类不存在")
  return c.json({
    success: true,
    list: result,
  })
}

export const deleteImageCategoryById: RouteHandler<typeof deleteImageCategoryRoute> = async (c) => {
  const { id } = c.req.valid("param")
  const result = await deleteDbImageCategory(id)
  if (!result) throw new AppError(404, "图片分类不存在")
  return c.json({
    success: true,
    list: result,
  })
}

export const getAllImageCategory: RouteHandler<typeof getAllImageCategoryRoute> = async (c) => {
  const { page, pageSize } = c.req.valid("query")
  const lruResult = imagesCategoriesCache.get(`${page}_${pageSize}`)
  if (lruResult)
    return c.json({
      success: true,
      list: lruResult.list,
      total: lruResult.total,
      page,
      pageSize,
    })
  const { list, total } = await getDbAllImageCategory(page, pageSize)
  imagesCategoriesCache.set(`${page}_${pageSize}`, { list, total })
  return c.json({
    success: true,
    list,
    total,
    page,
    pageSize,
  })
}

export const getImageCategoryById: RouteHandler<typeof getImageCategoryByIdRoute> = async (c) => {
  const { id } = c.req.valid("param")
  const { page, pageSize } = c.req.valid("query")
  const lruResult = imagesCache.get(`${id}_${page}_${pageSize}`)
  if (lruResult)
    return c.json({
      success: true,
      list: lruResult.list,
      total: lruResult.total,
      page,
      pageSize,
    })
  const result = await getDbAllImagesByCategoryId(id, page, pageSize)
  if (!result) throw new AppError(404, "图片分类不存在")
  imagesCache.set(`${id}_${page}_${pageSize}`, result)
  return c.json({
    success: true,
    list: result.list,
    total: result.total,
    page,
    pageSize,
  })
}
