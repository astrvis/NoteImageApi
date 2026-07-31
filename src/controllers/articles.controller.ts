import type { RouteHandler } from "@hono/zod-openapi"
import { AppError } from "../errors/app-error.js"
import { getDbAllArticles, getDbArticleById } from "../repositories/articles.repo.js"
import { getArticleRoute, getArticlesRoute } from "../routes/definition/articles.definition.js"
import { articleCache, articlesCache } from "../utils/lruCache.js"

export const getAllArticles: RouteHandler<typeof getArticlesRoute> = async (c) => {
  const { page, pageSize } = c.req.valid("query")
  const result = articlesCache.get(`${page}_${pageSize}`)
  if (result)
    return c.json({ success: true, list: result.list, total: result.total, page, pageSize })
  const { list, total } = await getDbAllArticles(page, pageSize)
  articlesCache.set(`${page}_${pageSize}`, { list, total })
  return c.json({ success: true, list, total, page, pageSize })
}

export const getArticleById: RouteHandler<typeof getArticleRoute> = async (c) => {
  const { id } = c.req.valid("param")
  const result = articleCache.get(id)
  if (result) return c.json({ success: true, list: result })
  const list = await getDbArticleById(id)
  if (!list) throw new AppError(404, "文章不存在")
  articleCache.set(id, list)
  return c.json({ success: true, list })
}
