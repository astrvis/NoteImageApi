import { count, desc, eq, getTableColumns } from "drizzle-orm";
import { db } from "../db/index.js";
import { images } from "../db/schema.js";
export const addDbImage = async (formData, tx) => {
    const DBTx = (tx ?? db);
    const [list] = await DBTx.insert(images)
        .values(formData)
        .returning({
        ...getTableColumns(images),
    });
    return list;
};
export const deleteDbImage = async (id, tx) => {
    const DBTx = (tx ?? db);
    const [list] = await DBTx.delete(images).where(eq(images.id, id)).returning({
        id: images.id,
    });
    return list;
};
export const updateDbImage = async (id, formData, tx) => {
    const DBTx = (tx ?? db);
    const [list] = await DBTx.update(images)
        .set(formData)
        .where(eq(images.id, id))
        .returning({
        ...getTableColumns(images),
    });
    return list;
};
export const getDbImages = async (page, pageSize, tx) => {
    const DBTx = (tx ?? db);
    const [list, total] = await Promise.all([
        DBTx.query.images.findMany({
            orderBy: desc(images.createDate),
            offset: (page - 1) * pageSize,
            limit: pageSize,
        }),
        DBTx.select({ count: count() }).from(images),
    ]);
    return { list, total: total[0].count };
};
export const getDbImageBySha = async (sha, tx) => {
    const DBTx = (tx ?? db);
    const list = await DBTx.query.images.findFirst({
        where: eq(images.sha, sha),
    });
    return list;
};
export const getDbImageById = async (id, tx) => {
    const DBTx = (tx ?? db);
    const list = await DBTx.query.images.findFirst({
        where: eq(images.id, id),
    });
    return list;
};
