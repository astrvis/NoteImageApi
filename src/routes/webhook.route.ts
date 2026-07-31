import { OpenAPIHono } from "@hono/zod-openapi"
import { webhook } from "../controllers/webhook.controller.js"
import { webhookRoute } from "./definition/webhook.definition.js"

export const webhookRoutes = new OpenAPIHono()
webhookRoutes.openapi(webhookRoute, webhook)
