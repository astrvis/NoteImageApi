import { serve } from "@hono/node-server";
import { app } from "./routes/app.js";
const IS_VERCEL = process.env.VERCEL === "1";
const IS_DEV = process.env.NODE_ENV !== "production";
if (!IS_VERCEL) {
    serve({
        fetch: app.fetch,
        port: Number(process.env.PORT ?? 3000),
    }, (info) => {
        console.log(`Server is running on http://localhost:${info.port}`);
    });
}
export default app;
