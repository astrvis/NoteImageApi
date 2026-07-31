import { z } from "@hono/zod-openapi";
export const authScheam = z.object({
    authorization: z.string().openapi({
        param: {
            name: "Authorization",
            in: "header",
        },
        example: "Bearer eyJhbGciOiJIUzI1...",
    }),
});
