import type { RouteHandler } from "@hono/zod-openapi"
import { config } from "../config.js"
import { AppError } from "../errors/app-error.js"
import { getDbImageCategoryById } from "../repositories/images.categories.repo.js"
import {
  deleteDbImage,
  getDbImageById,
  getDbImageBySha,
  getDbImages,
  updateDbImage,
} from "../repositories/images.repo.js"

import type { ImagesCategoriesSelect } from "../db/schema.js"
import type {
  addImageRoute,
  deleteImageRoute,
  getAllImagesRoute,
  getImageByShaRoute,
  updateImageRoute,
} from "../routes/definition/images.definition.js"
import { addImageService } from "../service/images.service.js"
import { copyToR2, deleteFromR2 } from "../service/r2.js"
import { imageCache, imagesCache } from "../utils/lruCache.js"
export type ImageDataRequset = {
  name: string
  image: {
    type: string
    size: number
  }
  imageData: Buffer
  category: ImagesCategoriesSelect
}
export const addImage: RouteHandler<typeof addImageRoute> = async (c) => {
  const { name, categoryId, image } = c.req.valid("form")
  const category = await getDbImageCategoryById(categoryId)
  if (!category) throw new AppError(404, "图片分类不存在")
  const buffer = await image.arrayBuffer()
  const imageData = Buffer.from(buffer)
  const data: ImageDataRequset = {
    name,
    image: {
      type: image.type,
      size: image.size,
    },
    imageData,
    category,
  }
  const result = await addImageService(data)
  imageCache.set(result.data.sha, result.data)
  return c.json(result)
}

export const deleteImage: RouteHandler<typeof deleteImageRoute> = async (c) => {
  const { id } = c.req.valid("param")
  try {
    const image = await getDbImageById(id)
    if (!image) throw new AppError(404, "图片不存在")

    await deleteFromR2(image.path)
    await deleteFromR2(image.thumbnailPath)
    const result = await deleteDbImage(id)
    imageCache.delete(image.sha)
    return c.json({
      success: true,
      message: "删除成功",
      data: result,
    })
  } catch (err) {
    if (err instanceof AppError) {
      throw err
    }
    console.error(err)
    throw new AppError(500, "删除图片失败")
  }
}

export const updateImage: RouteHandler<typeof updateImageRoute> = async (c) => {
  const { id } = c.req.valid("param")

  const { name, categoryId } = c.req.valid("json")
  const category = await getDbImageCategoryById(categoryId)
  if (!category) throw new AppError(404, "图片分类不存在")
  const updateData = {
    name,
    categoryId,
    updateDate: Date.now(),
  }
  const image = await getDbImageById(id)
  if (!image) throw new AppError(404, "图片不存在")
  const newImagePath = `${config.r2.image}/${category.name}/${image.sha}.${image.type.split("/")[1]}`
  const newThumbnailPath = `${config.r2.thumbnail}/${category.name}/${image.thumbnailSha}.${config.r2.thumbnailType}`
  try {
    // 1. 复制原图
    await copyToR2(image.path, newImagePath)

    // 2. 复制缩略图
    try {
      await copyToR2(image.thumbnailPath, newThumbnailPath)
    } catch (err) {
      // 回滚已复制的原图
      try {
        await deleteFromR2(newImagePath)
      } catch (e) {
        console.error("回滚删除新原图失败", e)
      }

      throw err
    }

    // 3. 更新数据库
    const result = await updateDbImage(id, updateData)

    if (!result) {
      // 回滚新文件
      try {
        await deleteFromR2(newImagePath)
      } catch (e) {
        console.error("回滚删除新原图失败", e)
      }

      try {
        await deleteFromR2(newThumbnailPath)
      } catch (e) {
        console.error("回滚删除新缩略图失败", e)
      }

      throw new AppError(404, "图片不存在")
    }

    // 4. 删除旧文件（失败不影响接口）
    try {
      await deleteFromR2(image.path)
    } catch (e) {
      console.error("删除旧原图失败", e)
    }

    try {
      await deleteFromR2(image.thumbnailPath)
    } catch (e) {
      console.error("删除旧缩略图失败", e)
    }
    imageCache.delete(image.sha)
    imageCache.set(result.sha, result)
    return c.json({
      success: true,
      message: "更新成功",
      data: result,
    })
  } catch (err) {
    if (err instanceof AppError) {
      throw err
    }

    console.error(err)
    throw new AppError(500, "更新图片失败")
  }
}

export const getAllImages: RouteHandler<typeof getAllImagesRoute> = async (c) => {
  const { page, pageSize } = c.req.valid("query")
  const lruResult = imagesCache.get(`${page}_${pageSize}`)
  if (lruResult)
    return c.json({
      success: true,
      message: "获取成功",
      data: {
        list: lruResult.list,
        total: lruResult.total,
        page,
        pageSize: pageSize,
      },
    })
  const { list, total } = await getDbImages(page, pageSize)
  imagesCache.set(`${page}_${pageSize}`, { list, total })
  return c.json({
    success: true,
    message: "获取成功",
    data: {
      list,
      total,
      page,
      pageSize,
    },
  })
}

export const getImageBySha: RouteHandler<typeof getImageByShaRoute> = async (c) => {
  const { sha } = c.req.valid("param")
  const lruResult = imageCache.get(sha)
  if (lruResult)
    return c.json({
      success: true,
      message: "获取成功",
      data: lruResult,
    })

  const image = await getDbImageBySha(sha)
  if (!image) throw new AppError(404, "图片不存在")
  imageCache.set(sha, image)
  return c.json({
    success: true,
    message: "获取成功",
    data: image,
  })
}
