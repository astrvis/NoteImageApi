import bcrypt from "bcrypt";
import crypto from "crypto";
import { eq, sql } from "drizzle-orm";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { basename, join, relative } from "path";
import { config } from "../config.js";
import { db } from "./index.js";
import { articles, categories, users, userSession } from "./schema.js";
export const NOTE_DIR = "/mnt/d/astvis/my-development/web/Note";
/**
 * 计算 git blob 的 SHA-1 值
 * @param content 文件内容
 * @returns SHA-1 值
 */
const calcGitBlobSha = (content) => {
    const buf = Buffer.from(content, "utf-8");
    const header = Buffer.from(`blob ${buf.length}\0`, "utf-8");
    return crypto
        .createHash("sha1")
        .update(Buffer.concat([header, buf]))
        .digest("hex");
};
/**
 * 递归获取目录下所有文件
 * @param dir 目录路径
 * @returns 所有文件路径列表
 * */
const getAllFiles = (dir) => {
    const results = [];
    for (const entry of readdirSync(dir)) {
        const fullPath = join(dir, entry);
        if (statSync(fullPath).isDirectory()) {
            if (entry === ".git")
                continue;
            results.push(...getAllFiles(fullPath));
        }
        else {
            results.push(fullPath);
        }
    }
    return results;
};
/**
 * 获取 Note 目录中所有文件（排除 readme.md）
 * @returns Note 文件列表
 */
export const getNoteFiles = () => getAllFiles(NOTE_DIR)
    .filter((fullPath) => basename(fullPath).toLowerCase() !== "readme.md")
    .map((fullPath) => {
    const content = readFileSync(fullPath, "utf-8");
    return {
        sha: calcGitBlobSha(content),
        path: relative(NOTE_DIR, fullPath).replace(/\\/g, "/"),
        name: basename(fullPath).replace(/\.md$/, ""),
        content,
    };
});
/**
 * 读取单个 Note 文件（按相对路径），文件不存在则返回 null
 * @param relativePath 相对路径（例如 "2023-01-01/2023-01-01-0001.md"）
 * @returns Note 文件内容
 */
export const readNoteFile = (relativePath) => {
    const fullPath = join(NOTE_DIR, relativePath);
    if (!existsSync(fullPath))
        return null;
    const content = readFileSync(fullPath, "utf-8");
    return {
        sha: calcGitBlobSha(content),
        path: relativePath.replace(/\\/g, "/"),
        name: basename(fullPath).replace(/\.md$/, ""),
        content,
    };
};
/**
 * 初始化数据库，建表并写入数据
 * @param files Note 文件列表
 * @returns 初始化完成
 * */
export const initDatabase = async (files) => {
    try {
        // console.log(files)
        for (const file of files) {
            // console.log(file)
            const date = Date.now();
            const topDir = file.path.split("/");
            let categoryName = "";
            if (config.topDir && (topDir[0] !== config.topDir || topDir.length !== 3))
                continue;
            if (!config.topDir && topDir.length !== 2)
                continue;
            if (config.topDir) {
                categoryName = topDir[1];
            }
            else {
                categoryName = topDir[0];
            }
            if (!categoryName || categoryName === undefined)
                continue;
            let categoryId = 0;
            const result = await db.query.categories.findFirst({
                where: eq(categories.name, categoryName),
            });
            if (!result) {
                // 插入分类
                const result2 = await db.insert(categories).values({
                    name: categoryName,
                    createDate: date,
                    updateDate: date,
                });
                categoryId = Number(result2.lastInsertRowid);
            }
            else {
                categoryId = Number(result.id);
            }
            //   .onConflictDoNothing()
            // 查询分类
            // const catRows = await db
            //   .select()
            //   .from(categories)
            //   .where(eq(categories.name, categoryName))
            // const cat = catRows[0]
            // 插入文章
            await db
                .insert(articles)
                .values({
                sha: file.sha,
                path: file.path,
                name: file.name,
                content: file.content,
                categoryId: categoryId,
                createDate: date,
                updateDate: date,
            })
                .onConflictDoNothing();
            // 延时保留
            await new Promise((r) => setTimeout(r, 20));
        }
        console.log("✅初始化导入完成");
    }
    catch (error) {
        console.error("❌初始化导入失败", error);
    }
};
/**
 * 清空数据库表
 *
 */
export const clearTables = async () => {
    // 顺序不能改：先子表 articles，再主表 categories
    // await db.delete(articles)
    // await db.delete(categories)
    // 重置自增id
    // await db.run(sql`DELETE FROM sqlite_sequence WHERE name='articles'`)
    // await db.run(sql`DELETE FROM sqlite_sequence WHERE name='categories'`)
    await db.delete(userSession);
    await db.run(sql `DELETE FROM sqlite_sequence WHERE name='userSession'`);
    console.log("✅ 数据表清空完成");
};
const createUser = async (username, password = "123456") => {
    const pwd = await bcrypt.hash(password, 10);
    db.insert(users)
        .values({
        username: username,
        passwordHash: pwd,
        createDate: Date.now(),
        updateDate: Date.now(),
    })
        .onConflictDoUpdate({
        target: users.username,
        set: {
            passwordHash: pwd,
        },
    })
        .run();
    console.log(`✅ 用户创建完成 ${username}Password: ${password}`);
};
if (import.meta.main) {
    const cmd = process.argv[2];
    switch (cmd) {
        case "clear":
            await clearTables();
            break;
        case "init":
            const files = getNoteFiles();
            await initDatabase(files);
            break;
        case "createImageUser":
            const username = process.argv[3] || "admin";
            const password = process.argv[4] || "123456";
            await createUser(username, password);
            break;
    }
}
