import { eq } from "drizzle-orm";
import { config } from "../config.js";
import { db } from "../db/index.js";
import { articles } from "../db/schema.js";
import { deleteDbNotExistArticleCategory, getOrAddCategoryByName } from "./categories.repo.js";
export const syncNotes = async (toUpsert, toRemove) => {
    return await db.transaction(async (tx) => {
        for (const path of toRemove) {
            await tx.delete(articles).where(eq(articles.path, path));
            const categoryName = config.topDir ? path.split("/")[1] : path.split("/")[0];
            await deleteDbNotExistArticleCategory(categoryName, tx);
        }
        for (const file of toUpsert) {
            const category = await getOrAddCategoryByName(file.categoryName);
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
            });
        }
    });
};
