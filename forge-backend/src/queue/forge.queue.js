// src/queue/forge.queue.js

import Bull from 'bull'
import { config } from '../config/env.js'

console.log('🔄 Initializing Forge queue...')

// ✅ SIMPLE & STABLE (NO CUSTOM REDIS CLIENT)
// userGeminiApiKey is now supported in job.data (passed from service)
export const forgeQueue = new Bull('forge-generation', config.REDIS_URL, {
  redis: {
    tls: {}, // ✅ REQUIRED for Upstash
  },

  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 200,
    timeout: 120000,
  },
})

// Logs
forgeQueue.on('error', (err) => {
  console.error('[ForgeQueue] Queue error:', err.message)
})

forgeQueue.on('failed', (job, err) => {
  console.error(`[ForgeQueue] Job ${job.id} failed:`, err.message)
})

forgeQueue.on('completed', (job) => {
  console.log(`[ForgeQueue] Job ${job.id} completed`)
})

console.log('✅ Forge queue initialized')