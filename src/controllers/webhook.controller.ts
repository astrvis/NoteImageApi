import type { RouteHandler } from "@hono/zod-openapi"
import type { webhookRoute } from "../routes/definition/webhook.definition.js"
import { webhookSync } from "../service/webhook.service.js"
import { articleCache, articlesCache, articlesCategoriesCache } from "../utils/lruCache.js"

export const webhook: RouteHandler<typeof webhookRoute> = async (c) => {
  articlesCache.clear()
  articleCache.clear()
  articlesCategoriesCache.clear()
  const result = await webhookSync(c)
  return c.json(result)
}
