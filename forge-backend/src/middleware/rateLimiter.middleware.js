// src/middleware/rateLimiter.middleware.js
import rateLimit from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import { redisClient } from '../config/redis.js'
import { config } from '../config/env.js'

// Global: 100 requests per 15 minutes per IP
export const globalRateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
})

// AI endpoints: 10 requests per hour per authenticated user
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: config.AI_RATE_LIMIT_MAX,
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

// ✅ Auth endpoints: 100 login/register attempts per 15 minutes per IP (for development/testing)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,  // Increased to 100 for development - production should be much lower
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/refresh',  // Don't rate limit refresh token endpoint
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  message: {
    success: false,
    error: 'Too many login attempts. Please try again in 15 minutes.',
  },
})
