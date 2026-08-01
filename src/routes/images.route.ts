import { OpenAPIHono } from "@hono/zod-openapi"
import {
  addImage,
  deleteImage,
  getAllImages,
  getImageBySha,
  updateImage,
} from "../controllers/images.controller.js"

import {
  addImageRoute,
  deleteImageRoute,
  getAllImagesRoute,
  getImageByShaRoute,
  updateImageRoute,
} from "./definition/images.definition.js"

export const adminIimagesRoutes = new OpenAPIHono()
export const publicImagesRoutes = new OpenAPIHono()

adminIimagesRoutes.openapi(addImageRoute, addImage)
adminIimagesRoutes.openapi(deleteImageRoute, deleteImage)
adminIimagesRoutes.openapi(updateImageRoute, updateImage)
publicImagesRoutes.openapi(getAllImagesRoute, getAllImages)
publicImagesRoutes.openapi(getImageByShaRoute, getImageBySha)
