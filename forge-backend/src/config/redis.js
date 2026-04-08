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
export const redisClient = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: null,
})

/*
────────────────────────────────────────────
✅ CONNECTION EVENTS (for debugging)
────────────────────────────────────────────
*/

redisClient.on('connect', () => {
  console.log('✅ Redis connected')
})

redisClient.on('error', (err) => {
  console.error('❌ Redis error:', err.message)
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