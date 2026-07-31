import { OpenAPIHono } from "@hono/zod-openapi"
import {
  addImageCategory,
  deleteImageCategoryById,
  getAllImageCategory,
  getImageCategoryById,
  updateImageCategoryById,
} from "../controllers/imagesCategories.controller.js"
import {
  addImageCategoryRoute,
  deleteImageCategoryRoute,
  getAllImageCategoryRoute,
  getImageCategoryByIdRoute,
  updateImageCategoryRoute,
} from "./definition/images.categories.definition.js"

export const publicImagesCategoriesRoutes = new OpenAPIHono()
export const adminImagesCategoriesRoutes = new OpenAPIHono()

adminImagesCategoriesRoutes.openapi(addImageCategoryRoute, addImageCategory)
adminImagesCategoriesRoutes.openapi(updateImageCategoryRoute, updateImageCategoryById)
adminImagesCategoriesRoutes.openapi(deleteImageCategoryRoute, deleteImageCategoryById)
publicImagesCategoriesRoutes.openapi(getAllImageCategoryRoute, getAllImageCategory)
publicImagesCategoriesRoutes.openapi(getImageCategoryByIdRoute, getImageCategoryById)
