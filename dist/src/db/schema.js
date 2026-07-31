import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const categories = sqliteTable("categories", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull().unique(),
    createDate: integer("create_date", { mode: "number" }).notNull(),
    updateDate: integer("update_date", { mode: "number" }).notNull(),
});
export const articles = sqliteTable("articles", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sha: text("sha").notNull().unique(),
    path: text("path").notNull().unique(),
    name: text("name").notNull(),
    content: text("content").notNull(),
    categoryId: integer("category_id")
        .references(() => categories.id)
        .notNull(),
    // id: 0,
    createDate: integer("create_date", { mode: "number" }).notNull(),
    updateDate: integer("update_date", { mode: "number" }).notNull(),
});
// ===== 关系声明 =====
export const categoriesRelations = relations(categories, ({ many }) => ({
    articles: many(articles),
}));
export const articlesRelations = relations(articles, ({ one }) => ({
    category: one(categories, {
        fields: [articles.categoryId],
        references: [categories.id],
    }),
}));
export const userSession = sqliteTable("user_session", {
    id: text("id").primaryKey(),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    createDate: integer("create_date").notNull(),
    expireDate: integer("expire_date").notNull(),
    revoked: integer("revoked", { mode: "boolean" }).default(false).notNull(),
    device: text("device").notNull(),
    ip: text("ip").notNull(),
    browser: text("browser").notNull(),
    os: text("os").notNull(),
});
export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    username: text("username").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    createDate: integer("create_date", { mode: "number" }).notNull(),
    updateDate: integer("update_date", { mode: "number" }).notNull(),
});
export const images = sqliteTable("images", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sha: text("sha").notNull().unique(),
    path: text("path").notNull().unique(),
    name: text("name").notNull(),
    thumbnailPath: text("thumbnail_path").notNull().unique(),
    thumbnailSha: text("thumbnail_sha").notNull().unique(),
    size: integer("size").notNull(),
    type: text("type").notNull(),
    categoryId: integer("category_id")
        .notNull()
        .references(() => imagesCategory.id),
    createDate: integer("create_date", { mode: "number" }).notNull(),
    updateDate: integer("update_date", { mode: "number" }).notNull(),
});
export const imagesCategory = sqliteTable("images_category", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull().unique(),
    createDate: integer("create_date", { mode: "number" }).notNull(),
    updateDate: integer("update_date", { mode: "number" }).notNull(),
});
export const imagesCategoryRelations = relations(imagesCategory, ({ many }) => ({
    images: many(images),
}));
export const imagesRelations = relations(images, ({ one }) => ({
    category: one(imagesCategory, {
        fields: [images.categoryId],
        references: [imagesCategory.id],
    }),
}));
