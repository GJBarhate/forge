// src/middleware/rateLimiter.middleware.js
import rateLimit from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import { redisClient } from '../config/redis.js'
import { config } from '../config/env.js'

// Determine rate limits based on environment
const isDev = config.NODE_ENV === 'development'

// Global rate limiter
// Dev: 50,000/hour (very permissive for testing)
// Prod: 5,000/hour (reasonable for public API)
export const globalRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: isDev ? 50000 : 5000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Don't rate limit these critical endpoints
    if (req.path.includes('/auth/refresh')) return true
    if (req.path.includes('/health')) return true
    return false
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
})

// AI endpoints: per authenticated user
// Dev: 1000/hour (testing)
// Prod: 100/hour (prevent abuse)
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: isDev ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `ai:${req.user?.id ?? req.ip}`,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  message: {
    success: false,
    error: 'AI generation limit reached. Please wait before generating again.',
  },
})

// Auth endpoints: login/register
// Dev: 1000/hour (heavy testing)
// Prod: 30 per 15 minutes (prevent brute force)
export const authRateLimiter = rateLimit({
  windowMs: isDev ? 60 * 60 * 1000 : 15 * 60 * 1000,
  max: isDev ? 1000 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.includes('/refresh'),  // Don't rate limit refresh token endpoint
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  message: {
    success: false,
    error: isDev ? 'Too many login attempts. Try again soon.' : 'Too many login attempts. Try again in 15 minutes.',
  },
})
