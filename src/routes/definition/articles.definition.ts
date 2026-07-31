import { createRoute } from "@hono/zod-openapi"
import {
  ArticleParamsSchema,
  ArticleQuerySchema,
  ArticleResponseSchema,
  ArticlesResponseSchema,
} from "../../schemas/article.schema.js"
export const getArticlesRoute = createRoute({
  method: "get",
  path: "/articles",
  tags: ["文章"],
  request: {
    query: ArticleQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ArticlesResponseSchema,
        },
      },
      description: "获取文章列表",
    },
  },
})

export const getArticleRoute = createRoute({
  method: "get",
  path: "/articles/{id}",
  tags: ["文章"],
  request: {
    params: ArticleParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ArticleResponseSchema,
        },
      },
      description: "获取文章详情",
    },
  },
})
