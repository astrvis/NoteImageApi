import { FastifyReply } from "fastify"
import { z } from "zod"

/**
 * Zod统一校验封装
 * @param data request.body / request.query / request.params
 * @param schema zod schema
 * @param reply fastify reply
 * @returns 成功返回解析数据，失败直接send，函数返回null
 */
export function zodValidate<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  reply: FastifyReply,
): T | null {
  const result = schema.safeParse(data)
  if (result.success) {
    return result.data
  }

  const firstIssue = result.error.issues[0]
  let message = "参数格式错误"
  if (firstIssue) {
    const field = firstIssue.path.join(".")
    message = `${field} 参数错误`
  }
  reply.resp(message, {}, 400)
  return null
}
// 登录请求
export const LoginRequestSchema = z.object({
  username: z.string(),
  password: z.string(),
})
// 自动推导 TS 类型，替代你手写 type LoginRequest
export type LoginRequest = z.infer<typeof LoginRequestSchema>

export const UploadImageRequestSchema = z.object({
  name: z.string(),
  categoryId: z.number().int(),
  image: z.instanceof(Buffer),
})

export type UploadImageRequest = z.infer<typeof UploadImageRequestSchema>

export const UpdateImageRequestSchema = z.object({
  name: z.string(),
  categoryId: z.number().int(),
})

export type UpdateImageRequest = z.infer<typeof UpdateImageRequestSchema>

export const GetAllRequestSchema = z.object({
  page: z.coerce.number().int().min(1),
  pagesize: z.coerce.number().int().min(1).max(100),
})
export type GetAllRequest = z.infer<typeof GetAllRequestSchema>

export const AddUpdateImageCategoryRequestSchema = z.object({
  name: z.string(),
})
export type AddUpdateImageCategoryRequest = z.infer<
  typeof AddUpdateImageCategoryRequestSchema
>
