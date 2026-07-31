import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { authMiddleware } from "../middlewares/auth.js";
import { onError, zodError } from "../middlewares/req.error.js";
import { articleRoutes } from "./articles.route.js";
import { categoryRoutes } from "./catregories.route.js";
import { adminImagesCategoriesRoutes, publicImagesCategoriesRoutes, } from "./images.categories.route.js";
import { adminIimagesRoutes, publicImagesRoutes } from "./images.route.js";
import { loginRoutes } from "./login.route.js";
import { webhookRoutes } from "./webhook.route.js";
export const app = new OpenAPIHono({
    defaultHook: zodError,
});
app.onError((err, c) => onError(err, c));
app.get("/", (c) => {
    return c.redirect("/docs");
});
app.doc("/doc", {
    openapi: "3.1.0",
    info: {
        title: "Note API",
        version: "1.0.0",
        description: `## NoteImageApi

基于 Hono 框架构建的知识库图片管理 API，提供文章、分类、图片存储管理及 GitHub Webhook 等功能。

### 功能模块

- **认证系统**：JWT Bearer Token 登录与刷新，HttpOnly Cookie 存储 Refresh Token
- **文章管理**：文章列表查询、详情查询、按分类聚合
- **分类管理**：分类 CRUD、分类与文章关联查询
- **图片管理**：图片上传至 S3/R2 对象存储，自动生成缩略图（Sharp），支持分类管理
- **Webhook**：GitHub Webhook 事件接收

### 权限说明

- **公开接口**（\`/api\`）：文章、分类、图片的只读查询
- **管理接口**（\`/api/admin\`）：图片及图片分类的增删改操作，需 Bearer Token 认证
- **认证接口**（\`/api/auth\`）：登录与 Token 刷新`,
    },
});
app.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
});
app.get("/docs", Scalar({
    url: "/doc",
    theme: "purple",
    pageTitle: "Note API",
    localization: {
        locale: "zh-CN",
    },
}));
app.route("/api/auth", loginRoutes);
app.route("/api", articleRoutes);
app.route("/api", categoryRoutes);
app.route("/api", publicImagesCategoriesRoutes);
app.route("/api", publicImagesRoutes);
app.route("/api", webhookRoutes);
app.use("/api/admin/*", authMiddleware);
app.route("/api/admin", adminImagesCategoriesRoutes);
app.route("/api/admin", adminIimagesRoutes);
