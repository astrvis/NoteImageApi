import { eq } from "drizzle-orm"
import { config } from "../config.js"
import { db } from "../db/index.js"
import { type ArticlesInsert, articles } from "../db/schema.js"
import { deleteDbNotExistArticleCategory, getOrAddCategoryByName } from "./categories.repo.js"

/**
 * 增量同步文章数据（事务）
 * @param toUpsert 待 upsert 文章数据列表
 * @param toRemove 待删除文章路径列表
 * @description 增量同步文章数据，先删除 removed 中的文章，再 upsert added/modified 的文章
 * - 先删除 removed 中的文章（按 path）
 * - 再 upsert added/modified 的文章（按 path 查找，存在则更新，不存在则插入）
 */

// 拼接额外关联字段
type ArticlesInsertWithCategory = ArticlesInsert & {
  categoryName: string
}
export const syncNotes = async (toUpsert: ArticlesInsertWithCategory[], toRemove: string[]) => {
  return await db.transaction(async (tx) => {
    for (const path of toRemove) {
      await tx.delete(articles).where(eq(articles.path, path))
      const categoryName = config.topDir ? path.split("/")[1] : path.split("/")[0]
      await deleteDbNotExistArticleCategory(categoryName, tx)
    }

    for (const file of toUpsert) {
      const category = await getOrAddCategoryByName(file.categoryName)
      await tx
        .insert(articles)
        .values({
          sha: file.sha,
          path: file.path,
          name: file.name,
          content: file.content,
          categoryId: category.id,
          createDate: file.createDate,
          updateDate: file.updateDate,
        })
        .onConflictDoUpdate({
          target: articles.path,
          set: {
            sha: file.sha,
            name: file.name,
            content: file.content,
            categoryId: category.id,
            updateDate: file.updateDate,
          },
        })
    }
  })
}
