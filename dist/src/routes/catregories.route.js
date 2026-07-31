import { OpenAPIHono } from "@hono/zod-openapi";
import { getAllCategories, getArticleByCategoriesId } from "../controllers/categories.controller.js";
import { getArticleByCategoriesIdRoute, getCategoriesRoute, } from "./definition/categories.definition.js";
const categoryRoutes = new OpenAPIHono();
categoryRoutes.openapi(getCategoriesRoute, getAllCategories);
categoryRoutes.openapi(getArticleByCategoriesIdRoute, getArticleByCategoriesId);
export { categoryRoutes };
