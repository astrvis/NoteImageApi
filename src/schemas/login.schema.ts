import { z } from "@hono/zod-openapi"

export const LoginRequestSchema = z.object({
  username: z.string("用户名不能为空").describe("用户名"),
  password: z.string("密码不能为空").describe("密码"),
})

export const LoginResponseSchema = z.object({
  success: z.boolean("登录成功").describe("登录是否成功"),
  accessToken: z.string("accessToken不能为空").describe("accessToken"),
  message: z.string("登录成功").describe("登录成功"),
  user: z.object({
    id: z.number("用户ID不能为空").describe("用户ID"),
    username: z.string("用户名不能为空").describe("用户名"),
  }),
})
