import { createRoute } from "@hono/zod-openapi"
import {
  categoriesParamsSchema,
  categoriesQuerySchema,
  categoriesResponseSchema,
  categoryResponseSchema,
} from "../../schemas/categories.schema.js"

export const getCategoriesRoute = createRoute({
  method: "get",
  path: "/categories",
  tags: ["分类"],
  request: {
    query: categoriesQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: categoriesResponseSchema,
        },
      },
      description: "获取文章列表",
    },
  },
})

export const getArticleByCategoriesIdRoute = createRoute({
  method: "get",
  path: "/categories/{id}",
  tags: ["分类"],
  request: {
    params: categoriesParamsSchema,
    query: categoriesQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: categoryResponseSchema,
        },
      },
      description: "获取文章分类列表",
    },
  },
})
