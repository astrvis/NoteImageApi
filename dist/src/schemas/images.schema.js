import { z } from "@hono/zod-openapi";
import { createSelectSchema } from "drizzle-zod";
import { config } from "../config.js";
import { images } from "../db/schema.js";
import { emptyToUndefined } from "../utils/comm.js";
export const ImageSchema = createSelectSchema(images);
export const ImageRequestBodySchema = z.object({
    name: z.string("名称不能为空").trim().min(1, "名称不能为空").describe("图片名称"),
    categoryId: z.coerce
        .number("分类ID字段必须是整数")
        .int()
        .positive()
        .min(1, "分类ID不能为空")
        .describe("分类ID"),
    image: z
        .instanceof(File, {
        message: "图片文件不能为空",
    })
        .refine((file) => file.type.startsWith("image/"), {
        message: "只能上传图片文件",
    })
        .refine((file) => file.size <= config.r2.maxFileSize, {
        message: `图片不能超过${config.r2.maxFileSize / 1024 / 1024}MB`,
    })
        .openapi({
        type: "string",
        format: "binary",
        description: "图片文件",
    }),
});
export const ImageAddResponseSchema = z.object({
    success: z.boolean().describe("是否成功"),
    list: ImageSchema.describe("图片列表"),
});
export const ImageDeleteResponseSchema = z.object({
    success: z.boolean().describe("是否成功"),
    list: z.object({
        id: z.number().describe("图片ID"),
    }),
});
export const ImageDeleteRequestParamsSchema = z.object({
    id: z.coerce.number("图片ID不能非数字").int().positive().min(1).describe("图片ID"),
});
export const ImageUpdateRequestBodySchema = z.object({
    name: z.string("名称不能为空").trim().min(1, "名称不能为空").describe("图片名称"),
    categoryId: z.coerce
        .number("分类ID字段必须是整数")
        .int()
        .positive()
        .min(1, "分类ID不能为空")
        .describe("分类ID"),
});
export const ImageUpdateResponseSchema = ImageAddResponseSchema;
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
export const getImagesResponseSchema = z.object({
    success: z.boolean().describe("是否成功"),
    list: ImageSchema.array().describe("图片列表"),
    total: z.number().describe("总数量"),
    page: z.number().describe("当前页码"),
    pageSize: z.number().describe("每页数量"),
});
export const getImageByIdParamsSchema = ImageDeleteRequestParamsSchema;
export const getImageByIdResponseSchema = z.object({
    success: z.boolean().describe("是否成功"),
    list: ImageSchema.describe("图片列表"),
});
