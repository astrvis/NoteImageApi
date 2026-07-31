import { createRoute } from "@hono/zod-openapi";
export const createAdminRoute = (config) => {
    return createRoute({
        ...config,
        security: [
            {
                bearerAuth: [],
            },
        ],
    });
};
