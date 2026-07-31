import { getDbAllCategories, getDbArticleByCategoriesId } from "../repositories/categories.repo.js";
import { articlesCache, articlesCategoriesCache } from "../utils/lruCache.js";
export const getAllCategories = async (c) => {
    const { page, pageSize } = c.req.valid("query");
    const result = articlesCategoriesCache.get(`${page}_${pageSize}`);
    if (result)
        return c.json({
            success: true,
            list: result.list,
            total: result.total,
            page,
            pageSize: pageSize,
        });
    const { list, total } = await getDbAllCategories(page, pageSize);
    articlesCategoriesCache.set(`${page}_${pageSize}`, { list, total });
    return c.json({
        success: true,
        list,
        total,
        page,
        pageSize,
    });
};
export const getArticleByCategoriesId = async (c) => {
    const { id } = c.req.valid("param");
    const { page, pageSize } = c.req.valid("query");
    const result = articlesCache.get(`${id}_${page}_${pageSize}`);
    if (result)
        return c.json({
            success: true,
            list: result.list,
            total: result.total,
            page,
            pageSize,
        });
    const { list, total } = await getDbArticleByCategoriesId(Number(id), page, pageSize);
    articlesCache.set(`${id}_${page}_${pageSize}`, { list, total });
    return c.json({
        success: true,
        list,
        total,
        page,
        pageSize,
    });
};
