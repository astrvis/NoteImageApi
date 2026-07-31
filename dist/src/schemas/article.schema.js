import { z } from "@hono/zod-openapi";
import { createSelectSchema } from "drizzle-zod";
import { articles } from "../db/schema.js";
import { emptyToUndefined } from "../utils/comm.js";
export const ArticleParamsSchema = z.object({
    id: z.coerce.number().int().positive().min(1).describe("文章ID").openapi({
        example: 1,
    }),
});
export const ArticleQuerySchema = z.object({
    page: emptyToUndefined(z.coerce.number({ message: "页码必须是整数且大于等于1" }).default(1)).openapi({
        param: {
            name: "page",
            in: "query",
        },
        description: "页码",
        default: 1,
    }),
    pageSize: emptyToUndefined(z.coerce.number({ message: "每页数量必须是整数且大于等于1" }).default(20)).openapi({
        param: {
            name: "pageSize",
            in: "query",
        },
        description: "每页数量",
        default: 20,
    }),
});
export const ArticleSchema = createSelectSchema(articles);
export const ArticlesResponseSchema = z.object({
    success: z.boolean(),
    total: z.number(),
    list: z.array(ArticleSchema),
    page: z.number(),
    pageSize: z.number(),
});
export const ArticleResponseSchema = z.object({
    success: z.boolean(),
    list: ArticleSchema,
});
