// src/controllers/auth.controller.js
import { asyncHandler } from '../utils/asyncHandler.js'
import * as authService from '../services/auth.service.js'

const COOKIE_NAME = 'refreshToken'
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
}

export const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body
  const { user, accessToken, refreshToken } = await authService.register({ email, password, name })

  res.cookie(COOKIE_NAME, refreshToken, COOKIE_OPTIONS)
  res.status(201).json({ success: true, data: { user, accessToken } })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const { user, accessToken, refreshToken } = await authService.login({ email, password })

  res.cookie(COOKIE_NAME, refreshToken, COOKIE_OPTIONS)
  res.status(200).json({ success: true, data: { user, accessToken } })
})

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[COOKIE_NAME]
  const { accessToken, user } = await authService.refresh(token)

  res.status(200).json({ success: true, data: { accessToken, user } })
})

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[COOKIE_NAME]
  await authService.logout(token)

  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  })
  res.status(200).json({ success: true, data: { message: 'Logged out successfully' } })
})

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id)
  res.status(200).json({ success: true, data: { user } })
})
