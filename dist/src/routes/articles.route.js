import { OpenAPIHono } from "@hono/zod-openapi";
import { getAllArticles, getArticleById } from "../controllers/articles.controller.js";
import { getArticleRoute, getArticlesRoute } from "./definition/articles.definition.js";
const articleRoutes = new OpenAPIHono();
articleRoutes.openapi(getArticlesRoute, getAllArticles);
articleRoutes.openapi(getArticleRoute, getArticleById);
export { articleRoutes };
