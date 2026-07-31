import { z } from "@hono/zod-openapi";
import { UAParser } from "ua-parser-js";
export const emptyToUndefined = (schema) => z.preprocess((value) => (value === "" ? undefined : value), schema);
export const getClientIp = (c) => {
    return (c.req.header("cf-connecting-ip") || // Cloudflare
        c.req.header("x-forwarded-for")?.split(",")[0] || // 代理
        "unknown");
};
export const getBrowserOsDevice = (c) => {
    const userAgent = c.req.header("user-agent") ?? "";
    const result = UAParser(userAgent);
    const browser = [result.browser.name, result.browser.version].filter(Boolean).join(" ");
    const os = [result.os.name, result.os.version].filter(Boolean).join(" ");
    const device = [result.device.type ?? "desktop", result.device.vendor, result.device.model]
        .filter(Boolean)
        .join(" ");
    return {
        browser,
        os,
        device,
    };
};
