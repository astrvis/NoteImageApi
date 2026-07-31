import { webhookSync } from "../service/webhook.service.js";
import { articleCache, articlesCache, articlesCategoriesCache } from "../utils/lruCache.js";
export const webhook = async (c) => {
    articlesCache.clear();
    articleCache.clear();
    articlesCategoriesCache.clear();
    const result = await webhookSync(c);
    return c.json(result);
};
