import {
  CopyObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { config } from "../config.js"

export const r2Client = new S3Client({
  region: "auto",
  endpoint: config.r2.endpoint,
  credentials: {
    accessKeyId: config.r2.accessKeyId,
    secretAccessKey: config.r2.secretAccessKey,
  },
})

/**
 * 上传文件到R2
 * @param buffer 文件二进制
 * @param ext 文件后缀 webp/png/jpg
 * @param mime image/webp
 * @returns 公开访问URL
 */
export const uploadToR2 = async (buffer: Buffer, path: string, mime: string): Promise<string> => {
  const maxRetry = 3
  let attempt = 0

  while (attempt < maxRetry) {
    attempt++
    const abortController = new AbortController()
    const timeoutMs = 20000
    const timer = setTimeout(() => {
      abortController.abort(new Error("R2上传超时"))
    }, timeoutMs)

    try {
      const cmd = new PutObjectCommand({
        Bucket: config.r2.bucket,
        Key: path,
        Body: buffer,
        ContentType: mime,
        CacheControl: "public, max-age=2592000",
      })

      const res = await r2Client.send(cmd, {
        abortSignal: abortController.signal,
      })
      console.log(`上传成功：${path}，第${attempt}次`)
      return `/${path}`
    } catch (err) {
      const error = err as Error
      console.error(`上传失败【第${attempt}/${maxRetry}次】${path}:`, error.message)

      // 达到最大重试次数，抛出错误交给上层catch
      if (attempt >= maxRetry) {
        throw new Error(`R2上传最终失败，已重试${maxRetry}次：${error.message}`)
      }
      // 简单等待1秒再重试，避免立刻轰炸
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } finally {
      clearTimeout(timer)
      abortController.abort() // 释放信号
    }
  }

  // 理论不会走到这里，兜底
  throw new Error("上传重试循环异常")
}

export const deleteFromR2 = async (path: string) => {
  const cmd = new DeleteObjectCommand({
    Bucket: config.r2.bucket,
    Key: path,
  })
  await r2Client.send(cmd)
}

export const copyToR2 = async (path: string, newPath: string) => {
  const cmd = new CopyObjectCommand({
    Bucket: config.r2.bucket,
    CopySource: `${config.r2.bucket}/${path}`,
    Key: newPath,
  })
  await r2Client.send(cmd)
}
