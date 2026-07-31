import { OpenAPIHono } from "@hono/zod-openapi";
import { login, refreshToken } from "../controllers/login.controller.js";
import { LoginRoute, refreshTokenRoute } from "./definition/login.definition.js";
export const loginRoutes = new OpenAPIHono();
loginRoutes.openapi(LoginRoute, login);
loginRoutes.openapi(refreshTokenRoute, refreshToken);
