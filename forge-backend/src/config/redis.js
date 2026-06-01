// src/config/redis.js

import Redis from 'ioredis'
import { config } from './env.js'

/*
────────────────────────────────────────────
🔥 FIXED VERSION — IMPORTANT CHANGES BELOW
────────────────────────────────────────────
*/

// ❌ REMOVED: lazyConnect: true
// WHY:
// - lazyConnect requires manual .connect()
// - Bull also tries to connect → conflict
// - Causes: "Redis already connecting/connected"

// ❌ REMOVED: enableReadyCheck: false
// WHY:
// - Not needed here
// - Can create unexpected connection states

// ✅ FIX: Let Redis AUTO-CONNECT (default behavior)
// With improved retry logic and connection pooling
export const redisClient = new Redis(config.REDIS_URL, {
  enableOfflineQueue: true,
  // ✅ FIXED: Cap retries at 10 to prevent infinite reconnect spam
  retryStrategy: (times) => {
    // Cap at 10 retries = max 5 second delay
    if (times > 10) {
      console.error('❌ [Redis] Max retries exceeded - giving up on Redis connection')
      return null // Stop retrying
    }
    const delay = Math.min(times * 100, 5000)
    if (times <= 3) console.log(`[Redis] Retry attempt ${times}, waiting ${delay}ms...`)
    return delay
  },
  // Keep-alive settings (increased from 30s to 60s)
  keepAlive: 60000,
  // Connection timeout (increased from 10s to 20s for Upstash latency)
  connectTimeout: 20000,
  // Commands timeout (increased from 5s to 15s)
  commandTimeout: 15000,
  // Lazy connect disabled - auto connect on creation
  lazyConnect: false,
})

/*
────────────────────────────────────────────
✅ CONNECTION EVENTS (for debugging)
────────────────────────────────────────────
*/

let reconnectAttempts = 0
const maxReconnectAttempts = 15

redisClient.on('connect', () => {
  reconnectAttempts = 0
  console.log('✅ Redis connected')
})

redisClient.on('error', (err) => {
  // Only log every Nth error to reduce spam
  if (err.message.includes('ECONNREFUSED') || err.message.includes('ETIMEDOUT')) {
    reconnectAttempts++
    if (reconnectAttempts > maxReconnectAttempts) {
      console.error('❌ Redis error:', err.message)
      console.error('⚠️  Redis connection unstable - Upstash may be experiencing issues')
    }
  } else {
    console.error('❌ Redis error:', err.message)
  }
})

redisClient.on('reconnecting', () => {
  if (reconnectAttempts <= 5) {
    console.log('[Redis] Attempting to reconnect...')
  }
})

/*
────────────────────────────────────────────
❌ REMOVED FUNCTION: connectRedis()
────────────────────────────────────────────

WHY REMOVED:

BEFORE:
- You used lazyConnect: true
- Then manually called redisClient.connect()

PROBLEM:
- Bull queue ALSO connects to Redis internally
- So Redis gets multiple connect calls
- → ERROR: "already connecting/connected"

NOW:
- Redis auto-connects when created
- No manual connect needed
- No conflict with Bull
*/