import { count, desc, eq, getTableColumns } from "drizzle-orm";
import { db } from "../db/index.js";
import { images, imagesCategory } from "../db/schema.js";
export const addDbImageCategory = async (formData, tx) => {
    const DBTx = (tx ?? db);
    const [imagesCategoryResult] = await DBTx.insert(imagesCategory)
        .values(formData)
        .returning({
        id: imagesCategory.id,
    })
        .onConflictDoNothing();
    return imagesCategoryResult;
};
export const updateDbImageCategory = async (id, formData, tx) => {
    const DBTx = (tx ?? db);
    const [imagesCategoryResult] = await DBTx.update(imagesCategory)
        .set(formData)
        .where(eq(imagesCategory.id, id))
        .returning({
        ...getTableColumns(imagesCategory),
    });
    return imagesCategoryResult;
};
export const deleteDbImageCategory = async (id, tx) => {
    const DBTx = (tx ?? db);
    const [imagesCategoryResult] = await DBTx.delete(imagesCategory)
        .where(eq(imagesCategory.id, id))
        .returning({
        id: imagesCategory.id,
    });
    return imagesCategoryResult;
};
export const getDbImageCategoryById = async (id, tx) => {
    const DBTx = (tx ?? db);
    const imagesCategoryResult = await DBTx.query.imagesCategory.findFirst({
        where: eq(imagesCategory.id, id),
    });
    return imagesCategoryResult;
};
export const getDbAllImageCategory = async (page, pageSize, tx) => {
    const DBTx = (tx ?? db);
    const [list, total] = await Promise.all([
        DBTx.query.imagesCategory.findMany({
            offset: (page - 1) * pageSize,
            limit: pageSize,
            orderBy: desc(imagesCategory.createDate),
        }),
        DBTx.select({ count: count() }).from(imagesCategory),
    ]);
    return { list, total: total[0].count };
};
export const getDbAllImagesByCategoryId = async (categoryId, page, pageSize, tx) => {
    const DBTx = (tx ?? db);
    const [list, total] = await Promise.all([
        DBTx.query.images.findMany({
            where: eq(images.categoryId, categoryId),
            offset: (page - 1) * pageSize,
            limit: pageSize,
            orderBy: desc(images.createDate),
        }),
        DBTx.select({ count: count() }).from(images).where(eq(images.categoryId, categoryId)),
    ]);
    return { list, total: total[0].count };
};
