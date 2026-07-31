import type { Context, ValidationTargets } from "hono"
import { ZodError } from "zod"
import { AppError } from "../errors/app-error.js"
/**
 * 处理错误
 * @param err
 * @param c
 * @returns
 */
export const onError = (err: unknown, c: Context) => {
  if (err instanceof AppError) {
    return c.json(
      {
        success: false,
        message: err.message,
      },
      err.status,
    )
  }

  if (err instanceof Error) {
    console.error(err)
    if (err.message.includes("Unauthorized")) {
      return c.json(
        {
          success: false,
          message: "登录已过期，请重新登录",
        },
        401,
      )
    }
    return c.json(
      {
        success: false,
        message: process.env.NODE_ENV === "development" ? err.message : "服务器内部错误",
      },
      500,
    )
  }

  console.error("Unknown error:", err)

  return c.json(
    {
      success: false,
      message: "未知错误",
    },
    500,
  )
}
type Error = { target: keyof ValidationTargets } & (
  { success: false; error: ZodError<unknown> } | { success: true; data: any }
)
/**
 * 处理zod校验错误
 * @param result
 * @param c
 * @returns
 */
export const zodError = (result: Error, c: Context) => {
  if (!result.success) {
    const message = [] as { field: string; message: string }[]
    for (const issue of result.error.issues) {
      message.push({ field: issue.path.join("."), message: issue.message })
    }

    return c.json(
      {
        success: false,
        message: "请求参数校验失败",
        errors: [...message],
      },
      400,
    )
  }
}
