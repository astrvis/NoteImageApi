import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import { AppError } from "../errors/app-error.js";
export const authMiddleware = createMiddleware(async (c, next) => {
    const authorization = c.req.header("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
        throw new AppError(401, "未登录");
    }
    const token = authorization.substring(7);
    try {
        const payload = await verify(token, process.env.ACCESS_TOKEN_SECRET, { alg: "HS256" });
        c.set("jwtPayload", payload);
        await next();
    }
    catch {
        throw new AppError(401, "登录已过期");
    }
});
