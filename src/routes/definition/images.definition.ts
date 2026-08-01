import { createRoute } from "@hono/zod-openapi"
import {
  getImageByIdParamsSchema,
  getImageByIdResponseSchema,
  getImagesRequestQuerySchema,
  getImagesResponseSchema,
  ImageAddResponseSchema,
  ImageDeleteRequestParamsSchema,
  ImageDeleteResponseSchema,
  ImageRequestBodySchema,
  ImageUpdateRequestBodySchema,
  ImageUpdateResponseSchema,
} from "../../schemas/images.schema.js"
import { createAdminRoute } from "../comm.js"

export const addImageRoute = createAdminRoute({
  method: "post",
  path: "/images",
  tags: ["图片"],
  request: {
    body: {
      required: true,
      content: {
        "multipart/form-data": {
          schema: ImageRequestBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ImageAddResponseSchema,
        },
      },
      description: "添加图片",
    },
  },
})

export const deleteImageRoute = createAdminRoute({
  method: "delete",
  path: "/images/{id}",
  tags: ["图片"],
  request: {
    params: ImageDeleteRequestParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ImageDeleteResponseSchema,
        },
      },
      description: "删除图片",
    },
  },
})

export const updateImageRoute = createAdminRoute({
  method: "patch",
  path: "/images/{id}",
  tags: ["图片"],
  request: {
    params: ImageDeleteRequestParamsSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: ImageUpdateRequestBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ImageUpdateResponseSchema,
        },
      },
      description: "更新图片",
    },
  },
})
export const getAllImagesRoute = createRoute({
  method: "get",
  path: "/images",
  tags: ["图片"],
  request: {
    query: getImagesRequestQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: getImagesResponseSchema,
        },
      },
      description: "获取图片列表",
    },
  },
})
export const getImageByShaRoute = createRoute({
  method: "get",
  path: "/images/{sha}",
  tags: ["图片"],
  request: {
    params: getImageByIdParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: getImageByIdResponseSchema,
        },
      },
      description: "获取图片列表",
    },
  },
})
