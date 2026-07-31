import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import { users, userSession, } from "../db/schema.js";
export const getDbImageUser = async (username) => {
    const user = await db.query.users.findFirst({
        where: eq(users.username, username),
    });
    return user;
};
/**
 * 根据用户名查询用户
 * @param username 用户名
 * @returns 用户
 */
export const getDbUserByUsernameFirst = async (username, tx) => {
    const DBTx = (tx ?? db);
    const result = await DBTx.query.users.findFirst({
        where: eq(users.username, username),
    });
    return result;
};
/**
 * 根据用户ID查询用户
 * @param id 用户ID
 * @returns 用户
 */
export const getDbUserByIdFirst = async (id, tx) => {
    const DBTx = (tx ?? db);
    const result = await DBTx.query.users.findFirst({
        where: eq(users.id, id),
    });
    return result;
};
/**
 * 插入用户
 * @param user 用户
 * @returns 插入结果
 */
export const insertDbUser = async (user, tx) => {
    const DBTx = (tx ?? db);
    return await DBTx.insert(users).values(user);
};
/**
 * 插入用户会话
 * @param session 会话
 * @returns 插入结果
 */
export const insertDbUserSession = async (session, tx) => {
    const DBTx = (tx ?? db);
    return await DBTx.insert(userSession).values(session);
};
/**
 * 根据会话ID查询用户会话
 * @param id 会话ID
 * @returns 会话
 */
export const getDbUserSessionFirst = async (id, tx) => {
    const DBTx = (tx ?? db);
    const result = await DBTx.query.userSession.findFirst({
        where: eq(userSession.id, id),
    });
    return result;
};
/**
 * 删除用户会话，保留最新的10个
 * @param userId 用户ID
 * @returns 删除结果
 */
export const deleteDbUserSessionSaveNewTen = async (userId, tx) => {
    const DBTx = (tx ?? db);
    const keepIds = await DBTx.select({ id: userSession.id })
        .from(userSession)
        .where(eq(userSession.userId, userId))
        .orderBy(desc(userSession.createDate))
        .limit(10)
        .all();
    const keepIdSet = new Set(keepIds.map((r) => r.id));
    const allSessions = await DBTx.select({ id: userSession.id })
        .from(userSession)
        .where(eq(userSession.userId, userId))
        .all();
    const deleteIds = allSessions.filter((r) => !keepIdSet.has(r.id)).map((r) => r.id);
    if (deleteIds.length === 0) {
        return { rowsAffected: 0, rows: [] };
    }
    return await DBTx.delete(userSession).where(and(eq(userSession.userId, userId), inArray(userSession.id, deleteIds)));
};
