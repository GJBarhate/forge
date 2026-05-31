// src/middleware/rateLimiter.middleware.js
import rateLimit from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import { redisClient } from '../config/redis.js'
import { config } from '../config/env.js'

// Determine rate limits based on environment
const isDev = config.NODE_ENV === 'development'

// In-memory store for fallback
class InMemoryStore {
  constructor() {
    this.hits = new Map()
    this.resets = new Map()
  }

  incr(key, cb) {
    if (!this.hits.has(key)) {
      this.hits.set(key, 0)
      this.resets.set(key, Date.now() + 60 * 60 * 1000)
    }

    const reset = this.resets.get(key)
    if (Date.now() > reset) {
      this.hits.set(key, 0)
      this.resets.set(key, Date.now() + 60 * 60 * 1000)
    }

    const hits = this.hits.get(key) + 1
    this.hits.set(key, hits)
    cb(null, hits)
  }

  decrement(key, cb) {
    const hits = Math.max(0, (this.hits.get(key) || 0) - 1)
    this.hits.set(key, hits)
    cb(null, hits)
  }

  resetKey(key, cb) {
    this.hits.delete(key)
    this.resets.delete(key)
    cb(null)
  }
}

let isRedisHealthy = true
const memoryStore = new InMemoryStore()

// Monitor Redis connection health
redisClient.on('error', () => {
  isRedisHealthy = false
  console.warn('⚠️ Redis unavailable - switching to memory store for rate limiting')
})

redisClient.on('connect', () => {
  isRedisHealthy = true
  console.log('✅ Redis recovered - rate limiter back to Redis store')
})

// Helper to get the appropriate store
const getStore = () => {
  if (isRedisHealthy && redisClient.status === 'ready') {
    return new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
      prefix: 'rl:', // rate limit prefix
    })
  }
  // Fallback to memory store
  return memoryStore
}

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
  store: getStore(),
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
  // This will use X-Forwarded-For header when trust proxy is set
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later.',
    })
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
  store: getStore(),
  message: {
    success: false,
    error: 'AI generation limit reached. Please wait before generating again.',
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'AI generation limit reached. Please wait before generating again.',
    })
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
  store: getStore(),
  message: {
    success: false,
    error: isDev ? 'Too many login attempts. Try again soon.' : 'Too many login attempts. Try again in 15 minutes.',
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: isDev ? 'Too many login attempts. Try again soon.' : 'Too many login attempts. Try again in 15 minutes.',
    })
  },
})
