import { count, desc, eq, getTableColumns } from "drizzle-orm"
import { db } from "../db/index.js"
import { articles, categories, type ArticlesSelect } from "../db/schema.js"

/**
 * 获取全部文章
 * @param page
 * @param pagesize
 * @returns
 */
export const getDbAllArticles = async (
  page: number,
  pagesize: number,
): Promise<{ list: ArticlesSelect[]; total: number }> => {
  const [list, total] = await Promise.all([
    db
      .select({
        ...getTableColumns(articles),
        categoryName: categories.name,
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .orderBy(desc(articles.createDate))
      .limit(pagesize)
      .offset((page - 1) * pagesize),

    db.select({ count: count() }).from(articles),
  ])
  return { list, total: Number(total[0].count) }
}

/**
 * 根据文章id获取文章
 * @param id
 * @returns
 */
export const getDbArticleById = async (id: number): Promise<ArticlesSelect | undefined> => {
  const list = await db
    .select({
      ...getTableColumns(articles),
      categoryName: categories.name,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.id, id))
    .limit(1)

  return list[0]
}
