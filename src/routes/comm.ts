import { createRoute, type RouteConfig } from "@hono/zod-openapi"

export const createAdminRoute = <T extends RouteConfig>(config: T) => {
  return createRoute({
    ...config,
    security: [
      {
        bearerAuth: [],
      },
    ],
  })
}
