// src/services/auth.service.js
import bcrypt from 'bcryptjs'
import { prisma } from '../config/database.js'
import { config } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwtUtils.js'
import { hashToken } from '../utils/hashToken.js'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
}

export async function register({ email, password, name }) {
  // Check if email already in use
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new ApiError(409, 'Email already in use')
  }

  const passwordHash = await bcrypt.hash(password, config.BCRYPT_ROUNDS)

  const user = await prisma.user.create({
    data: { email, passwordHash, name },
    select: { id: true, email: true, name: true, creditsBalance: true, geminiApiKey: true, createdAt: true },
  })

  const { accessToken, refreshToken } = await _generateTokenPair(user.id)

  return { user, accessToken, refreshToken }
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } })
  // Same error for missing user and wrong password — prevents user enumeration
  if (!user) throw new ApiError(401, 'Invalid credentials')

  const match = await bcrypt.compare(password, user.passwordHash)
  if (!match) throw new ApiError(401, 'Invalid credentials')

  const { accessToken, refreshToken } = await _generateTokenPair(user.id)

  const safeUser = { id: user.id, email: user.email, name: user.name, creditsBalance: user.creditsBalance, geminiApiKey: user.geminiApiKey, createdAt: user.createdAt }
  return { user: safeUser, accessToken, refreshToken }
}

export async function refresh(rawRefreshToken) {
  if (!rawRefreshToken) {
    throw new ApiError(401, 'Refresh token missing')
  }

  // Verify JWT signature
  const decoded = verifyRefreshToken(rawRefreshToken)

  // Look up the hashed token in DB using compound key (userId + tokenHash)
  const tokenHash = hashToken(rawRefreshToken)
  const storedToken = await prisma.refreshToken.findUnique({ 
    where: { 
      userId_tokenHash: {
        userId: decoded.id,
        tokenHash,
      }
    } 
  })

  if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
    throw new ApiError(401, 'Token expired or revoked')
  }

  // Issue a new access token (do not rotate refresh token — keep session alive)
  const accessToken = signAccessToken({ id: decoded.id })

  // Fetch user data to return with new token
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, email: true, name: true, creditsBalance: true, geminiApiKey: true, createdAt: true },
  })

  if (!user) {
    throw new ApiError(401, 'User not found')
  }

  return { accessToken, user }
}

export async function logout(rawRefreshToken) {
  if (!rawRefreshToken) return

  const tokenHash = hashToken(rawRefreshToken)
  const decoded = verifyRefreshToken(rawRefreshToken)
  
  await prisma.refreshToken.updateMany({
    where: { userId: decoded.id, tokenHash },
    data: { revoked: true },
  })
}

export async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, creditsBalance: true, geminiApiKey: true, createdAt: true, updatedAt: true },
  })
  if (!user) throw new ApiError(404, 'User not found')
  return user
}

// ── Private helpers ───────────────────────────────────────────

async function _generateTokenPair(userId) {
  const accessToken = signAccessToken({ id: userId })
  const refreshToken = signRefreshToken({ id: userId })

  const tokenHash = hashToken(refreshToken)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  // Delete any existing token with the same hash to avoid duplicate key errors
  await prisma.refreshToken.deleteMany({
    where: { userId, tokenHash },
  })

  await prisma.refreshToken.create({
    data: { userId, tokenHash, expiresAt },
  })

  return { accessToken, refreshToken }
}

export { COOKIE_OPTIONS }
