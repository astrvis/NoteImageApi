# NoteImageApi

基于 Hono 框架构建的知识库图片管理 API，提供文章、分类、图片存储管理及 GitHub Webhook 等功能。

## 技术栈

| 类别     | 技术                                                  | 说明                                              |
| -------- | ----------------------------------------------------- | ------------------------------------------------- |
| 框架     | [Hono](https://hono.dev/)                             | 轻量 Web 框架                                     |
| 语言     | TypeScript                                            | 类型安全                                          |
| 数据库   | SQLite / Turso (libSQL)                               | 开发环境用 SQLite，生产环境用 Turso               |
| ORM      | [Drizzle ORM](https://orm.drizzle.team/)              | 类型安全的 ORM                                    |
| 对象存储 | Cloudflare R2                                         | 图片及缩略图存储                                  |
| 数据校验 | [Zod](https://zod.dev/) + @hono/zod-openapi           | 请求/响应校验与 OpenAPI 文档生成                  |
| 缩略图   | [Sharp](https://sharp.pixelplumbing.com/)             | 图片处理与 WebP 缩略图生成                        |
| 缓存     | [LRU Cache](https://github.com/isaacs/node-lru-cache) | 内存缓存，5 分钟 TTL                              |
| 文档     | [Scalar](https://scalar.com/)                         | OpenAPI 文档 UI                                   |
| 认证     | JWT (Hono JWT)                                        | Bearer Token 认证 + HttpOnly Cookie Refresh Token |

## 功能模块

- **认证系统**：JWT Bearer Token 登录与刷新，HttpOnly Cookie 存储 Refresh Token，支持设备/IP/浏览器指纹
- **文章管理**：文章列表查询、详情查询、按分类聚合
- **分类管理**：分类 CRUD、分类与文章关联查询
- **图片管理**：图片上传至 Cloudflare R2，自动生成 WebP 缩略图（Sharp），支持分类管理
- **Webhook**：GitHub Webhook 事件接收，同步文章数据

## 快速开始

### 1. 环境要求

- Node.js >= 18
- pnpm（推荐）/ npm

### 2. 安装依赖

```bash
pnpm install
# 或
npm install
```

### 3. 配置环境变量

```bash
cp .env .env.local
```

编辑 `.env.local` 文件，填入所需配置（见下方环境变量说明）。

### 4. 初始化数据库

```bash
# 生成数据库表结构
pnpm db:push

# 初始化管理员账户
pnpm db:create
```

### 5. 启动开发服务器

```bash
pnpm dev
```

服务启动后访问：

- API 文档：`http://localhost:3000/docs`
- OpenAPI JSON：`http://localhost:3000/doc`

## 环境变量

| 变量名                 | 说明                                 | 必填     |
| ---------------------- | ------------------------------------ | -------- |
| `NODE_ENV`             | 环境模式（development / production） | 是       |
| `ACCESS_TOKEN_SECRET`  | JWT Access Token 签名密钥            | 是       |
| `REFRESH_TOKEN_SECRET` | JWT Refresh Token 签名密钥           | 是       |
| `COOKIE_SECRET`        | Cookie 签名密钥                      | 是       |
| `ACCOUNTID`            | Cloudflare R2 Account ID             | 是       |
| `ACCESS_KEY_ID`        | Cloudflare R2 Access Key ID          | 是       |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 Secret Access Key      | 是       |
| `WEBHOOK_SECRET`       | GitHub Webhook 签名密钥              | 是       |
| `GITHUB_TOKEN`         | GitHub Personal Access Token         | 是       |
| `TURSO_DATABASE_URL`   | Turso 数据库连接 URL（仅生产环境）   | 生产必填 |
| `TURSO_AUTH_TOKEN`     | Turso 认证 Token（仅生产环境）       | 生产必填 |

## 可用脚本

| 命令             | 说明                               |
| ---------------- | ---------------------------------- |
| `pnpm dev`       | 启动开发服务器（tsx watch 热重载） |
| `pnpm build`     | 编译 TypeScript                    |
| `pnpm start`     | 运行生产构建产物                   |
| `pnpm format`    | Prettier 格式化                    |
| `pnpm db:gen`    | Drizzle 生成迁移文件               |
| `pnpm db:push`   | 推送 Schema 到数据库               |
| `pnpm db:mig`    | 运行数据库迁移                     |
| `pnpm db:studio` | 启动 Drizzle Studio 数据库管理界面 |
| `pnpm db:clear`  | 清空所有数据库表                   |
| `pnpm db:init`   | 初始化数据库表结构                 |
| `pnpm db:create` | 创建管理员账户                     |

## API 路由结构

### 公开接口（无需认证）

| 方法 | 路径                           | 说明                        |
| ---- | ------------------------------ | --------------------------- |
| POST | `/api/auth/login`              | 用户登录，返回 Access Token |
| POST | `/api/auth/refresh`            | 刷新 Access Token           |
| GET  | `/api/articles`                | 获取文章列表                |
| GET  | `/api/articles/:id`            | 获取文章详情                |
| GET  | `/api/categories`              | 获取分类列表                |
| GET  | `/api/categories/:id/articles` | 按分类获取文章列表          |
| GET  | `/api/images`                  | 获取图片列表                |
| GET  | `/api/images/:id`              | 获取图片详情                |
| GET  | `/api/images/categories`       | 获取图片分类列表            |
| GET  | `/api/images/categories/:id`   | 获取图片分类详情            |
| POST | `/api/webhook`                 | 接收 GitHub Webhook 事件    |

### 管理接口（需 Bearer Token 认证）

| 方法   | 路径                               | 说明                            |
| ------ | ---------------------------------- | ------------------------------- |
| POST   | `/api/admin/images`                | 上传图片（multipart/form-data） |
| PATCH  | `/api/admin/images/:id`            | 更新图片信息                    |
| DELETE | `/api/admin/images/:id`            | 删除图片                        |
| POST   | `/api/admin/images/categories`     | 添加图片分类                    |
| PATCH  | `/api/admin/images/categories/:id` | 更新图片分类                    |
| DELETE | `/api/admin/images/categories/:id` | 删除图片分类                    |

## 认证机制

1. 客户端通过 `POST /api/auth/login` 提交用户名和密码
2. 服务端返回 `accessToken`（JWT，有效期 3 小时）和 `refresh_token`（HttpOnly Cookie，有效期 15 天）
3. 管理接口需在请求头携带 `Authorization: Bearer <accessToken>`
4. 当 Access Token 过期后，使用 `POST /api/auth/refresh` 通过 Refresh Token 获取新的 Access Token
5. Refresh Token 采用滑动窗口策略，7 天内自动续期

## 项目结构

``` text
src/
├── config.ts              # 全局配置
├── index.ts               # 应用入口
├── controllers/           # 控制器层（业务逻辑）
│   ├── articles.controller.ts
│   ├── categories.controller.ts
│   ├── images.controller.ts
│   ├── imagesCategories.controller.ts
│   ├── login.controller.ts
│   └── webhook.controller.ts
├── db/                    # 数据库层
│   ├── schema.ts          # Drizzle Schema 定义
│   ├── index.ts           # 数据库连接
│   └── init.ts            # 数据库初始化脚本
├── errors/                # 自定义错误
│   └── app-error.ts
├── middlewares/           # 中间件
│   ├── auth.ts            # JWT 认证中间件
│   └── req.error.ts       # 错误处理 & Zod 校验错误处理
├── repositories/          # 数据访问层
│   ├── articles.repo.ts
│   ├── categories.repo.ts
│   ├── images.repo.ts
│   ├── images.categories.repo.ts
│   ├── imageUser.repo.ts
│   └── types.ts
├── routes/                # 路由定义
│   ├── app.ts             # 应用路由装配
│   ├── articles.route.ts
│   ├── catregories.route.ts
│   ├── images.route.ts
│   ├── images.categories.route.ts
│   ├── login.route.ts
│   ├── webhook.route.ts
│   ├── comm.ts            # 公共路由工具
│   └── definition/        # OpenAPI 路由定义（Zod Schema）
│       ├── articles.definition.ts
│       ├── categories.definition.ts
│       ├── images.definition.ts
│       ├── images.categories.definition.ts
│       ├── login.definition.ts
│       └── webhook.definition.ts
├── schemas/               # Zod Schema 定义
│   ├── article.schema.ts
│   ├── categories.schema.ts
│   ├── images.schema.ts
│   ├── images.categories.schema.ts
│   ├── login.schema.ts
│   ├── schemas.ts         # 公共 Schema & 错误响应
├── service/               # 服务层
│   ├── r2.ts              # Cloudflare R2 对象存储操作
│   └── webhook.service.ts # Webhook 处理服务
└── utils/                 # 工具函数
    ├── comm.ts            # 通用工具（IP、浏览器解析）
    ├── lruCache.ts        # LRU 缓存实例
    └── request.ts         # 请求工具
```

## 数据库设计

### 核心表

- **users**：用户表（username、passwordHash）
- **user_session**：用户会话表（Refresh Token、设备指纹、IP）
- **categories**：文章分类表
- **articles**：文章表（关联 categories）
- **images_category**：图片分类表
- **images**：图片表（关联 imagesCategory，存储 SHA、路径、缩略图信息）

## 图片处理流程

1. 客户端通过 `multipart/form-data` 上传图片
2. 服务端使用 Sharp 生成 SHA-256 哈希作为文件名
3. 同步生成 400x400 WebP 缩略图
4. 原图和缩略图分别上传至 Cloudflare R2 对象存储
5. 数据库记录图片元信息（SHA、路径、大小、类型等）
6. 上传失败时自动清理已上传的文件
