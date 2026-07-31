import { createRoute } from "@hono/zod-openapi"
import { LoginRequestSchema, LoginResponseSchema } from "../../schemas/login.schema.js"

export const LoginRoute = createRoute({
  method: "post",
  path: "/login",
  tags: ["登录"],

  request: {
    body: {
      content: {
        "application/json": {
          schema: LoginRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: LoginResponseSchema,
        },
      },
      description: "登录成功",
    },
  },
})

export const refreshTokenRoute = createRoute({
  method: "post",
  path: "/refresh",
  tags: ["登录"],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: LoginResponseSchema,
        },
      },
      description: "刷新登录成功",
    },
  },
})
