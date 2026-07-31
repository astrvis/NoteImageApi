import type { ServiceInputTypes, ServiceOutputTypes } from "@aws-sdk/client-s3"
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
}) as S3Client & {
  send<Input extends ServiceInputTypes, Output extends ServiceOutputTypes>(command: {
    input: Input
    constructor: new () => any
  }): Promise<Output>
}

/**
 * 上传文件到R2
 * @param buffer 文件二进制
 * @param ext 文件后缀 webp/png/jpg
 * @param mime image/webp
 * @returns 公开访问URL
 */
export const uploadToR2 = async (buffer: Buffer, path: string, mime: string): Promise<string> => {
  const cmd = new PutObjectCommand({
    Bucket: config.r2.bucket,
    Key: path,
    Body: buffer,
    ContentType: mime,
    // 关键：长期缓存，减少后续B类回源
    CacheControl: "public, max-age=2592000",
  })

  const res = await r2Client.send(cmd)
  console.log(res)
  return `/${path}`
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
