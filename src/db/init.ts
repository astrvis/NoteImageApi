import bcrypt from "bcrypt"
import crypto from "crypto"
import { eq } from "drizzle-orm"
import { existsSync, readdirSync, readFileSync, statSync } from "fs"
import { basename, extname, join, relative } from "path"
import { config } from "../config.js"
import type { ImageDataRequset } from "../controllers/images.controller.js"
import { getOrAddDbImageCategory } from "../repositories/images.categories.repo.js"
import { addImageService } from "../service/images.service.js"
import { db } from "./index.js"
import { articles, categories, users } from "./schema.js"

export interface NoteFile {
  sha: string
  path: string
  name: string
  content: string
}

/**
 * 计算 git blob 的 SHA-1 值
 * @param content 文件内容
 * @returns SHA-1 值
 */
const calcGitBlobSha = (content: string): string => {
  const buf = Buffer.from(content, "utf-8")
  const header = Buffer.from(`blob ${buf.length}\0`, "utf-8")
  return crypto
    .createHash("sha1")
    .update(Buffer.concat([header, buf]))
    .digest("hex")
}

/**
 * 递归获取目录下所有文件
 * @param dir 目录路径
 * @returns 所有文件路径列表
 * */
const getAllFiles = (dir: string): string[] => {
  const results: string[] = []
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    if (statSync(fullPath).isDirectory()) {
      if (entry === ".git") continue
      results.push(...getAllFiles(fullPath))
    } else {
      results.push(fullPath)
    }
  }
  return results
}

/**
 * 获取 Note 目录中所有文件（排除 readme.md）
 * @returns Note 文件列表
 */
export const getNoteFiles = (DIR: string): NoteFile[] =>
  getAllFiles(DIR)
    .filter((fullPath) => basename(fullPath).toLowerCase() !== "readme.md")
    .map((fullPath) => {
      const content = readFileSync(fullPath, "utf-8")
      return {
        sha: calcGitBlobSha(content),
        path: relative(DIR, fullPath).replace(/\\/g, "/"),
        name: basename(fullPath).replace(/\.md$/, ""),
        content,
      }
    })

/**
 * 读取单个 Note 文件（按相对路径），文件不存在则返回 null
 * @param relativePath 相对路径（例如 "2023-01-01/2023-01-01-0001.md"）
 * @returns Note 文件内容
 */
export const readNoteFile = (relativePath: string): NoteFile | null => {
  const fullPath = join(relativePath)
  if (!existsSync(fullPath)) return null
  const content = readFileSync(fullPath, "utf-8")
  return {
    sha: calcGitBlobSha(content),
    path: relativePath.replace(/\\/g, "/"),
    name: basename(fullPath).replace(/\.md$/, ""),
    content,
  }
}

/**
 * 初始化数据库，建表并写入数据
 * @param files Note 文件列表
 * @returns 初始化完成
 * */
export const initDatabase = async (files: NoteFile[]) => {
  try {
    // console.log(files)
    for (const file of files) {
      // console.log(file)
      const date = Date.now()
      const topDir = file.path.split("/")
      let categoryName = ""
      if (config.topDir && (topDir[0] !== config.topDir || topDir.length !== 3)) continue
      if (!config.topDir && topDir.length !== 2) continue
      if (config.topDir) {
        categoryName = topDir[1]
      } else {
        categoryName = topDir[0]
      }

      if (!categoryName || categoryName === undefined) continue
      let categoryId = 0
      const result = await db.query.categories.findFirst({
        where: eq(categories.name, categoryName),
      })

      if (!result) {
        // 插入分类
        const result2 = await db.insert(categories).values({
          name: categoryName,
          createDate: date,
          updateDate: date,
        })
        categoryId = Number(result2.lastInsertRowid)
      } else {
        categoryId = Number(result.id)
      }

      //   .onConflictDoNothing()

      // 查询分类
      // const catRows = await db
      //   .select()
      //   .from(categories)
      //   .where(eq(categories.name, categoryName))
      // const cat = catRows[0]

      // 插入文章

      await db
        .insert(articles)
        .values({
          sha: file.sha,
          path: file.path,
          name: file.name,
          content: file.content,
          categoryId: categoryId,
          createDate: date,
          updateDate: date,
        })
        .onConflictDoNothing()

      // 延时保留
      await new Promise((r) => setTimeout(r, 20))
    }
    console.log("✅初始化导入完成")
  } catch (error) {
    console.error("❌初始化导入失败", error)
  }
}
/**
 * 清空数据库表
 *
 */

export const clearTables = async () => {
  // 顺序不能改：先子表 articles，再主表 categories
  // await db.delete(articles)
  // await db.delete(categories)
  // 重置自增id
  // await db.run(sql`DELETE FROM sqlite_sequence WHERE name='articles'`)
  // await db.run(sql`DELETE FROM sqlite_sequence WHERE name='categories'`)
  // await db.delete(userSession)
  // await db.run(sql`DELETE FROM sqlite_sequence WHERE name='userSession'`)
  // console.log("✅ 数据表清空完成")
}

const createUser = async (username: string, password: string = "123456") => {
  const pwd = await bcrypt.hash(password, 10)
  db.insert(users)
    .values({
      username: username,
      passwordHash: pwd,
      createDate: Date.now(),
      updateDate: Date.now(),
    })
    .onConflictDoUpdate({
      target: users.username,
      set: {
        passwordHash: pwd,
      },
    })
    .run()
  console.log(`✅ 用户创建完成 ${username}Password: ${password}`)
}
/**
 * 从字符串中提取数字前缀
 * @param str 输入字符串
 * @returns   loading_1718 → loading
              凌华_荧_17181617 → 凌华_荧
 */
function extractPrefix(str: string): string {
  const parts = str.split("_")
  const resultParts: string[] = []

  for (const part of parts) {
    // 判断当前片段是不是纯数字
    const isAllNum = /^\d+$/.test(part)
    if (isAllNum) break
    resultParts.push(part)
  }
  return resultParts.join("_")
}
type ImagesFile = {
  categoryName: string
  name: string
  size: number
  type: string
  buffer: Buffer
}
export const getImagesFiles = (DIR: string): ImagesFile[] => {
  const imageExts = new Set([
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".avif",
    ".svg",
    ".ico", // 图标
    ".bmp", // 位图
  ])
  const imageMimeMap: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".bmp": "image/bmp",
    ".apng": "image/png",
  }

  const data = getAllFiles(DIR)
    .filter((fullPath) => basename(fullPath).toLowerCase() !== "readme.md")
    .filter((fullPath) => imageExts.has(extname(fullPath).toLowerCase()))
    .filter((fullPath) => relative(DIR, fullPath).replace(/\\/g, "/").split("/").length === 2)
    .map((fullPath) => {
      const buf = readFileSync(fullPath)
      const path = relative(DIR, fullPath).replace(/\\/g, "/")
      const categoryName = path.split("/")[0]
      const name = extractPrefix(path.split("/")[1])
      return {
        categoryName,
        name,
        size: statSync(fullPath).size,
        type: imageMimeMap[extname(fullPath).toLowerCase()],
        buffer: buf,
      }
    })
  return data
}

const insertImages = async () => {
  const imagesDir = "/mnt/d/astvis/my-development/images-bed/images"
  const imageFiles = getImagesFiles(imagesDir)
  console.log(imageFiles.length)
  // console.log(imageFiles)
  let i = 0

  for (const image of imageFiles) {
    try {
      const category = await getOrAddDbImageCategory(image.categoryName)
      const data: ImageDataRequset = {
        name: image.name,
        image: {
          size: image.size,
          type: image.type,
        },
        imageData: image.buffer,
        category,
      }
      console.log(`开始导入第${i}张图片 ${image.categoryName}/${image.name}`)
      await addImageService(data)
      console.log(`✅导入第${i}张图片 ${image.categoryName}/${image.name}成功`)
    } catch (error) {
      console.error(`❌导入第${i}张图片 ${image.categoryName}/${image.name}失败 `, error)
    }
    i++
    // 延时保留
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}
if (import.meta.main) {
  const cmd = process.argv[2]
  switch (cmd) {
    case "clear":
      await clearTables()
      break
    case "init":
      const NOTE_DIR = "/mnt/d/astvis/my-development/web/Note"
      const files = getNoteFiles(NOTE_DIR)
      await initDatabase(files)
      break
    case "createImageUser":
      const username = process.argv[3] || "admin"
      const password = process.argv[4] || "123456"
      await createUser(username, password)
      break
    case "initImages":
      await insertImages()
      break
  }
}
