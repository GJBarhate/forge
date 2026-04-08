// src/app.js
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { config } from './config/env.js'
import { requestLogger } from './middleware/requestLogger.middleware.js'
import { globalRateLimiter } from './middleware/rateLimiter.middleware.js'
import { errorHandler } from './middleware/errorHandler.middleware.js'
import { router } from './routes/index.js'

export function createApp() {
  const app = express()

  // 1. Security headers
  app.use(helmet())

  // 2. CORS — allow frontend origin with credentials
  app.use(
    cors({
      origin: config.CLIENT_URL,
      credentials: true,
    })
  )

  // 3. Body parsers
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  // 4. Cookie parser (for HttpOnly refresh token cookie)
  app.use(cookieParser())

  // 5. HTTP request logging
  app.use(requestLogger)

  // 6. API routes FIRST (before global rate limiter)
  // This ensures auth endpoints use their own limiter
  app.use('/api/v1', router)

  // 7. Global rate limiter (Redis-backed) for non-API routes
  app.use(globalRateLimiter)

  // 8. Health check (outside rate limit)
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // 9. 404 handler
  app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' })
  })

  // 10. Global error handler (must be last)
  app.use(errorHandler)

  return app
}
