import { z } from "@hono/zod-openapi"
import type { Context } from "hono"
import { UAParser } from "ua-parser-js"

export const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema)

export const getClientIp = (c: Context) => {
  return (
    c.req.header("cf-connecting-ip") || // Cloudflare
    c.req.header("x-forwarded-for")?.split(",")[0] || // 代理
    "unknown"
  )
}

export const getBrowserOsDevice = (
  c: Context,
): {
  browser: string
  os: string
  device: string
} => {
  const userAgent = c.req.header("user-agent") ?? ""

  const result = UAParser(userAgent)

  const browser = [result.browser.name, result.browser.version].filter(Boolean).join(" ")

  const os = [result.os.name, result.os.version].filter(Boolean).join(" ")

  const device = [result.device.type ?? "desktop", result.device.vendor, result.device.model]
    .filter(Boolean)
    .join(" ")
  return {
    browser,
    os,
    device,
  }
}
