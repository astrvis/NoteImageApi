import type { RouteHandler } from "@hono/zod-openapi"
import bcrypt from "bcrypt"
import { getCookie } from "hono/cookie"

import type { Context } from "hono"
import { setCookie } from "hono/cookie"
import { sign } from "hono/jwt"
import { config } from "../config.js"
import { db } from "../db/index.js"
import { AppError } from "../errors/app-error.js"
import {
  deleteDbUserSessionSaveNewTen,
  getDbImageUser,
  getDbUserByIdFirst,
  getDbUserSessionFirst,
  insertDbUserSession,
} from "../repositories/imageUser.repo.js"
import type { LoginRoute, refreshTokenRoute } from "../routes/definition/login.definition.js"
import { getBrowserOsDevice, getClientIp } from "../utils/comm.js"
export const login: RouteHandler<typeof LoginRoute> = async (c) => {
  const { username, password } = c.req.valid("json")
  const user = await getDbImageUser(username)
  if (!user) throw new AppError(404, "用户名不存在")
  const isPwdMatch = await bcrypt.compare(password, user.passwordHash)
  if (!isPwdMatch) throw new AppError(401, "密码错误")
  const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
  const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET
  if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
    console.error("ACCESS_TOKEN_SECRET或REFRESH_TOKEN_SECRET未配置")
    throw new AppError(500, "服务器错误")
  }

  const accessToken = await sign(
    {
      id: user.id,
      username: user.username,
      exp: Math.floor(Date.now() / 1000) + config.accessTokenExpire / 1000, // 3 小时
    },
    ACCESS_TOKEN_SECRET,
  )
  const expRefresh = Math.floor(Date.now() / 1000) + config.refreshTokenExpire / 1000 // 15 天
  const refreshToken = crypto.randomUUID()
  await refreshTokenCookie(c, refreshToken, config.refreshTokenExpire / 1000)
  const { browser, os, device } = getBrowserOsDevice(c)
  const insertData = {
    id: refreshToken,
    userId: user.id,
    createDate: Date.now(),
    expireDate: expRefresh * 1000,
    device,
    ip: getClientIp(c),
    browser,
    revoked: false,
    os,
  }
  console.log(insertData)
  await db.transaction(async (tx) => {
    await insertDbUserSession(
      insertData,
      tx, // 传入事务实例！纳入事务管控
    )

    await deleteDbUserSessionSaveNewTen(user.id, tx)
  })
  return c.json({
    success: true,
    message: "登录成功",
    data: {
      accessToken,
      id: user.id,
      username: user.username,
    },
  })
}

const refreshTokenCookie = async (c: Context, refreshToken: string, maxAge: number) => {
  setCookie(c, "refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    path: "/api/auth",
    maxAge: maxAge,
  })
}

export const refreshToken: RouteHandler<typeof refreshTokenRoute> = async (c) => {
  const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET
  const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
  if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
    console.error("ACCESS_TOKEN_SECRET或REFRESH_TOKEN_SECRET未配置")
    throw new AppError(500, "服务器错误")
  }
  if (!REFRESH_TOKEN_SECRET) {
    console.error("REFRESH_TOKEN_SECRET未配置")
    throw new AppError(500, "服务器错误")
  }

  const refreshToken = getCookie(c, "refresh_token")
  if (!refreshToken) throw new AppError(401, "refreshToken不存在")
  const session = await getDbUserSessionFirst(refreshToken)
  if (!session || session.revoked || session.expireDate < Date.now()) {
    throw new AppError(401, "refreshToken 无效或已过期")
  }

  const user = await getDbUserByIdFirst(session.userId)
  if (!user) throw new AppError(404, "用户不存在")

  if (session.expireDate < Date.now() + config.refreshTokenExpireMin) {
    // 刷新时间未超过 7 天，刷新 accessToken
    const refreshToken = crypto.randomUUID()

    const now = Date.now()
    const { browser, os, device } = getBrowserOsDevice(c)
    const expireAt = now + config.refreshTokenExpire
    const insertData = {
      id: refreshToken,
      userId: session.userId,
      createDate: now,
      expireDate: expireAt,
      device,
      ip: getClientIp(c),
      browser,
      revoked: false,
      os,
    }

    await db.transaction(async (tx) => {
      await insertDbUserSession(insertData, tx)
      // 删除用户会话最新10条之前的数据
      await deleteDbUserSessionSaveNewTen(session.userId, tx)
      await refreshTokenCookie(c, refreshToken, config.refreshTokenExpire / 1000)
    })
  }
  const accessToken = await sign(
    {
      id: user.id,
      username: user.username,
      exp: Math.floor(Date.now() / 1000) + config.accessTokenExpire / 1000, // 3 小时
    },
    ACCESS_TOKEN_SECRET,
  )
  return c.json({
    success: true,
    message: "刷新成功",
    data: {
      accessToken,
      id: user.id,
      username: user.username,
    },
  })
}
