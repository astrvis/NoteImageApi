import { createRoute, z } from "@hono/zod-openapi"

export const webhookRoute = createRoute({
  path: "/webhook",
  method: "post",
  tags: ["Webhook"],
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
      description: "接收 webhook 事件成功",
    },
  },
})
