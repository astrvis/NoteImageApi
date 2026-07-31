import { z } from "@hono/zod-openapi";
import { createSelectSchema } from "drizzle-zod";
import { imagesCategory } from "../db/schema.js";
import { emptyToUndefined } from "../utils/comm.js";
export const imagesCategorySelectSchema = createSelectSchema(imagesCategory);
export const ImageCategoryRequestSchema = z.object({
    name: z.string().trim().nonempty("分类名称不能为空").describe("图片分类名称"),
});
export const ImageCategoryAddResponseSchema = z.object({
    success: z.boolean().describe("是否成功"),
    list: imagesCategorySelectSchema.describe("添加的图片分类"),
});
export const ImageCategoryRequestParamsSchema = z.object({
    id: z.coerce.number().int().positive().describe("图片分类id"),
});
export const ImageCategoryUpdateRequestBodySchema = z.object({
    name: z.string().trim().nonempty("分类名称不能为空").describe("图片分类名称"),
});
export const ImageCategoryUpdateResponseSchema = z.object({
    success: z.boolean().describe("是否成功"),
    list: imagesCategorySelectSchema.describe("更新的图片分类"),
});
export const ImageCategoryDeleteResponseSchema = z.object({
    success: z.boolean().describe("是否成功"),
    list: z
        .object({
        id: z.coerce.number().int().positive().describe("删除图片分类id"),
    })
        .describe("删除的图片分类"),
});
export const ImageCategoryGetAllResponseSchema = z.object({
    success: z.boolean().describe("是否成功"),
    list: z.array(imagesCategorySelectSchema).describe("所有图片分类"),
    total: z.number().describe("总数量"),
    page: z.number().describe("页码"),
    pageSize: z.number().describe("每页数量"),
});
export const getImagesRequestQuerySchema = z.object({
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
