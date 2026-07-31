import crypto from "crypto"
import type { Context } from "hono"
import { config } from "../config.js"
import type { ArticlesInsert } from "../db/schema.js"
import { AppError } from "../errors/app-error.js"
import { syncNotes } from "../repositories/webhookSync.js"

type Commit = {
  added: string[]
  removed: string[]
  modified: string[]
}

type DataType = {
  ref: string
  repository: {
    name: string
    owner: { name: string }
  }
  commits: Commit[]
}

/**
 * 验证 GitHub Webhook 签名（HMAC SHA-256）
 */
const verifySignature = (secret: string, headerSig: string, rawBodyText: string): boolean => {
  const hmac = crypto.createHmac("sha256", secret)

  const expected = `sha256=${hmac.update(rawBodyText, "utf8").digest("hex")}`

  const expectedBuffer = Buffer.from(expected, "utf8")
  const signatureBuffer = Buffer.from(headerSig, "utf8")

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
}

/**
 * 仅处理 .md 文件，排除 readme.md
 */
const isNoteFile = (path: string): boolean => {
  const lower = path.toLowerCase()
  return lower.endsWith(".md") && !lower.endsWith("readme.md")
}
/**
 * 如果 config.topDir不为空，处理 config.topDir 的文件
 * 否则处理所有文件
 * 排除 readme.md
 */
const isNoteFileWithTopDir = (path: string): boolean => {
  const parts = path.split("/")
  if (config.topDir) {
    return isNoteFile(path) && config.topDir === parts[0] && parts.length === 3
  } else {
    return isNoteFile(path) && parts.length === 2
  }
}

/**
 * 从路径中提取顶级目录名（分类名）
 */
const getCategoryFromPath = (path: string): string | null => {
  const parts = path.split("/")
  // return parts.length > config.github_dir + 1 ? parts[config.github_dir] : null
  return config.topDir ? parts[1] : parts[0].trim()
}

/**
 * 从文件路径提取文件名（不含 .md 后缀）
 */
const getNameFromPath = (path: string): string => {
  const base = path.split("/").pop() ?? path
  return base.replace(/\.md$/i, "")
}

type FetchDataType = {
  sha: string
  content: string
  path: string
  name: string
  type: string
  encoding: string
}
/**
 * GitHub Contents API: 获取单个文件内容（base64 解码）
 */
const fetchFileFromGitHub = async (
  owner: string,
  repo: string,
  path: string,
  ref: string,
  token: string,
): Promise<FetchDataType | null> => {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,

      Accept: "application/vnd.github.object+json",
    },
  })

  if (!res.ok) return null
  const data = (await res.json()) as FetchDataType

  if (data.type !== "file") return null
  // 必须同时满足编码与内容存在
  if (data.encoding !== "base64" || typeof data.content !== "string") return null
  const content = Buffer.from(data.content, "base64").toString("utf-8")
  return {
    sha: data.sha,
    content: content,
    path: data.path,
    name: data.name,
    encoding: data.encoding,
    type: data.type,
  }
}

export const webhookSync = async (c: Context) => {
  const headerSignature = c.req.header("x-hub-signature-256")
  if (!headerSignature) {
    throw new AppError(401, "缺少签名头")
  }

  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET!

  const rawBody = await c.req.text()
  const valid = verifySignature(WEBHOOK_SECRET, headerSignature, rawBody)
  if (!valid) {
    console.error("签名校验失败")
    throw new AppError(401, "签名校验失败")
  }

  // }
  const eventType = c.req.header("x-github-event")

  if (eventType !== "push") {
    console.info("非 push 事件，已忽略")
    return { message: "非 push 事件，已忽略", success: true }
  }
  const payload: DataType = await c.req.json()

  for (let i = 1; i <= 3; i++) {
    try {
      await webHookSyncPayload(payload)

      console.info("同步完成")

      return {
        success: true,
        message: "同步完成",
      }
    } catch (err) {
      console.error(`同步失败，第 ${i} 次`, err)

      if (i === 3) {
        if (err instanceof AppError) {
          throw err
        }
        throw new AppError(500, "同步失败,服务器错误")
      }

      // 等待 1 秒再重试
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }
}
type ArticlesInsertWithCategory = ArticlesInsert & {
  categoryName: string
}
export const webHookSyncPayload = async (payload: DataType) => {
  const owner = payload.repository.owner.name
  const repo = payload.repository.name
  const ref = payload.ref.replace("refs/heads/", "")
  if (ref !== config.ref) {
    console.info(`非 ${config.ref} 分支，已忽略`)
    return { message: `非 ${config.ref} 分支，已忽略`, success: true }
  }

  // // 聚合各 commit 中的 added/removed/modified（后出现的覆盖先出现的）
  const toUpsert = new Set<string>()
  const tempRemoved = new Set<string>()
  // console.info(payload.commits)

  for (const commit of payload.commits ?? []) {
    for (const path of commit.added) {
      if (!isNoteFileWithTopDir(path)) continue
      toUpsert.add(path)
    }
    for (const path of commit.modified) {
      if (!isNoteFileWithTopDir(path)) continue
      toUpsert.add(path)
    }
    for (const path of commit.removed) {
      if (!isNoteFileWithTopDir(path)) continue
      tempRemoved.add(path)
    }
  }

  const toRemove = new Set<string>()
  for (const path of tempRemoved) {
    if (!toUpsert.has(path)) {
      toRemove.add(path)
    }
  }

  if (toUpsert.size === 0 && toRemove.size === 0) {
    console.info("无 Note 文件变更")
    return { message: "无 Note 文件变更", success: true }
  }

  // // upsert 的文件从 GitHub API 获取内容
  const upsertFiles: ArticlesInsertWithCategory[] = []

  if (toUpsert.size > 0) {
    if (!process.env.GITHUB_TOKEN) {
      console.error("GITHUB_TOKEN 未配置")
      throw new AppError(500, "GITHUB_TOKEN 未配置")
    }

    for (const path of toUpsert) {
      const categoryName = getCategoryFromPath(path)
      if (!categoryName) continue

      const result = await fetchFileFromGitHub(owner, repo, path, ref, process.env.GITHUB_TOKEN!)

      if (!result) {
        console.error(`获取 ${path} 失败`)
        throw new AppError(500, `服务器错误`)
      }
      upsertFiles.push({
        sha: result.sha,
        path: path,
        name: getNameFromPath(path),
        content: result.content,
        categoryId: 0,
        categoryName: categoryName,
        createDate: Date.now(),
        updateDate: Date.now(),
      })
    }
  }

  await syncNotes(upsertFiles, [...toRemove])

  return { success: true, message: "同步完成" }
}
