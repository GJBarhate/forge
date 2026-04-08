// src/config/env.js
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  // FIXED: multi-key rotation now working — supports both GEMINI_API_KEY (single) and GEMINI_API_KEYS (comma-separated rotation)
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_API_KEYS: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),
  CLIENT_URL: z.string().url('CLIENT_URL must be a valid URL'),
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(3600000),  // 1 hour for development (was 15 min)
  RATE_LIMIT_MAX: z.coerce.number().default(10000),  // 10000/hour for development (was 1000)
  AI_RATE_LIMIT_MAX: z.coerce.number().default(500),  // 500/hour for development (was 100)
  // Razorpay payment gateway
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.format())
  process.exit(1)
}

// FIXED: Validate that at least one Gemini key is provided (either GEMINI_API_KEY or GEMINI_API_KEYS)
if (!parsed.data.GEMINI_API_KEY && !parsed.data.GEMINI_API_KEYS) {
  console.error('❌ Missing Gemini API configuration:')
  console.error('   Please provide either GEMINI_API_KEY or GEMINI_API_KEYS in .env')
  console.error('   Example: GEMINI_API_KEYS=key1,key2,key3,key4,key5')
  process.exit(1)
}

export const config = parsed.data
export default config;
