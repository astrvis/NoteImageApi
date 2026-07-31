import { createRoute } from "@hono/zod-openapi";
import { getImagesRequestQuerySchema, ImageCategoryAddResponseSchema, ImageCategoryDeleteResponseSchema, ImageCategoryGetAllResponseSchema, ImageCategoryRequestParamsSchema, ImageCategoryRequestSchema, ImageCategoryUpdateRequestBodySchema, ImageCategoryUpdateResponseSchema, } from "../../schemas/images.categories.schema.js";
import { createAdminRoute } from "../comm.js";
export const addImageCategoryRoute = createAdminRoute({
    method: "post",
    path: "/images/categories",
    tags: ["图片分类"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: ImageCategoryRequestSchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: ImageCategoryAddResponseSchema,
                },
            },
            description: "添加图片分类",
        },
    },
});
export const updateImageCategoryRoute = createAdminRoute({
    method: "patch",
    path: "/images/categories/{id}",
    tags: ["图片分类"],
    request: {
        params: ImageCategoryRequestParamsSchema,
        body: {
            content: {
                "application/json": {
                    schema: ImageCategoryUpdateRequestBodySchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: ImageCategoryUpdateResponseSchema,
                },
            },
            description: "更新图片分类",
        },
    },
});
export const deleteImageCategoryRoute = createAdminRoute({
    method: "delete",
    path: "/images/categories/{id}",
    tags: ["图片分类"],
    request: {
        params: ImageCategoryRequestParamsSchema,
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: ImageCategoryDeleteResponseSchema,
                },
            },
            description: "删除图片分类",
        },
    },
});
export const getAllImageCategoryRoute = createRoute({
    method: "get",
    path: "/images/categories",
    tags: ["图片分类"],
    request: {
        query: getImagesRequestQuerySchema,
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: ImageCategoryGetAllResponseSchema,
                },
            },
            description: "获取所有图片分类",
        },
    },
});
export const getImageCategoryByIdRoute = createRoute({
    method: "get",
    path: "/images/categories/{id}",
    tags: ["图片分类"],
    request: {
        params: ImageCategoryRequestParamsSchema,
        query: getImagesRequestQuerySchema,
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: ImageCategoryGetAllResponseSchema,
                },
            },
            description: "获取图片分类",
        },
    },
});
