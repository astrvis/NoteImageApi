import { z } from "@hono/zod-openapi";
import { createSelectSchema } from "drizzle-zod";
import { categories } from "../db/schema.js";
import { emptyToUndefined } from "../utils/comm.js";
import { ArticleSchema } from "./article.schema.js";
export const CategorySchema = createSelectSchema(categories);
export const categoriesResponseSchema = z.object({
    success: z.boolean().describe("是否成功"),
    list: z.array(CategorySchema).describe("分类列表"),
    total: z.coerce.number().int().positive().describe("总分类数"),
    page: z.coerce.number().int().positive().describe("页码"),
    pageSize: z.coerce.number().int().positive().describe("每页数量"),
});
export const categoryResponseSchema = categoriesResponseSchema.extend({
    success: z.boolean().describe("是否成功"),
    list: z.array(ArticleSchema).describe("文章列表"),
});
export const categoriesQuerySchema = z.object({
    page: emptyToUndefined(z.coerce.number({ message: "页码必须是整数且大于等于1" }).default(1)).openapi({
        param: {
            name: "page",
            in: "query",
        },
        description: "页码",
        default: 1,
    }),
    pageSize: emptyToUndefined(z.coerce.number({ message: "每页数量必须是整数且大于等于1" }).default(10)).openapi({
        param: {
            name: "pageSize",
            in: "query",
        },
        description: "每页数量",
        default: 10,
    }),
});
export const categoriesByArticleIdSchema = z.object({
    success: z.boolean().describe("是否成功"),
    list: z.array(CategorySchema).describe("分类列表"),
    total: z.coerce.number().int().positive().describe("总分类数"),
    page: z.coerce.number().int().positive().describe("页码").default(1),
    pageSize: z.coerce.number().int().positive().describe("每页数量").default(10),
});
export const categoriesParamsSchema = z.object({
    id: z.coerce.number().int().positive().min(1).describe("分类ID").openapi({
        example: 1,
    }),
});
