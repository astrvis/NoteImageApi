import { createHash } from "crypto"
import sharp from "sharp"
import { config } from "../config.js"
import type { ImageDataRequset } from "../controllers/images.controller.js"
import { AppError } from "../errors/app-error.js"
import { addDbImage, getDbImageBySha } from "../repositories/images.repo.js"
import { deleteFromR2, uploadToR2 } from "./r2.js"

export const addImageService = async (data: ImageDataRequset) => {
  const { name, image, imageData, category } = data

  const sha = createHash("sha256").update(imageData).digest("hex")
  const path = `${config.r2.image}/${category.name}/${sha}.${image.type.split("/")[1]}`
  const thumbBuffer = await sharp(imageData)
    .resize({ width: 400, height: 400, fit: "inside" })
    .rotate()
    .toFormat(config.r2.thumbnailType, { quality: 75 })
    .toBuffer()
  const thumbnailSha = createHash("sha256").update(thumbBuffer).digest("hex")
  const thumbnailPath = `${config.r2.thumbnail}/${category.name}/${thumbnailSha}.${config.r2.thumbnailType}`
  const formData = {
    name: name,
    categoryId: category.id,
    sha: sha,
    thumbnailSha: thumbnailSha,
    path: path,
    thumbnailPath: thumbnailPath,
    size: image.size / 1024 / 1024,
    type: image.type,
    createDate: Date.now(),
    updateDate: Date.now(),
  }
  try {
    const existingImage = await getDbImageBySha(sha)
    if (existingImage) throw new AppError(409, "图片已存在")

    await uploadToR2(imageData, path, image.type)
    await uploadToR2(thumbBuffer, thumbnailPath, config.r2.thumbnailType as string)

    const result = await addDbImage(formData)

    return {
      success: true,
      message: "添加成功",
      data: result,
    }
  } catch (err) {
    console.error(err)
    if (err instanceof AppError) {
      throw err
    }
    await deleteFromR2(path)
    await deleteFromR2(thumbnailPath)
    throw new AppError(500, "上传图片失败")
  }
}
