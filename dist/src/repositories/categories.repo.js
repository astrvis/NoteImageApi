import { count, desc, eq, getTableColumns } from "drizzle-orm";
import { db } from "../db/index.js";
import { articles, categories } from "../db/schema.js";
/**
 * 获取全部分类
 * @param page
 * @param pageSize
 * @returns
 */
export const getDbAllCategories = async (page, pageSize) => {
    const [list, total] = await Promise.all([
        db
            .select({
            ...getTableColumns(categories),
        })
            .from(categories)
            .orderBy(desc(categories.createDate))
            .limit(pageSize)
            .offset((page - 1) * pageSize),
        db.select({ count: count() }).from(categories),
    ]);
    return { list, total: Number(total[0].count) };
};
/**
 * 根据分类id获取文章
 * @param id
 * @param page
 * @param pageSize
 * @returns
 */
export const getDbArticleByCategoriesId = async (id, page, pageSize) => {
    const [list, total] = await Promise.all([
        db
            .select({
            ...getTableColumns(articles),
            categoryName: categories.name,
        })
            .from(articles)
            .leftJoin(categories, eq(articles.categoryId, categories.id))
            .orderBy(desc(articles.createDate))
            .limit(pageSize)
            .offset((page - 1) * pageSize)
            .where(eq(articles.categoryId, id)),
        db.select({ count: count() }).from(articles).where(eq(articles.categoryId, id)),
    ]);
    return { list, total: Number(total[0].count) };
};
/**
 * 根据分类名获取分类
 * @param name
 * @returns
 */
export const getOrAddCategoryByName = async (name) => {
    // 先查询
    const category = await db.query.categories.findFirst({
        where: eq(categories.name, name),
    });
    // 存在直接返回
    if (category) {
        return category;
    }
    // 不存在则创建
    const insetData = {
        name: name,
        createDate: Date.now(),
        updateDate: Date.now(),
    };
    const [newCategory] = await db.insert(categories).values(insetData).returning();
    return newCategory;
};
export const deleteDbNotExistArticleCategory = async (name, tx) => {
    const DBTx = (tx ?? db);
    const article = await DBTx.select({ id: articles.id })
        .from(articles)
        .innerJoin(categories, eq(articles.categoryId, categories.id))
        .where(eq(categories.name, name))
        .limit(1);
    if (article.length === 0) {
        await DBTx.delete(categories).where(eq(categories.name, name));
    }
};
