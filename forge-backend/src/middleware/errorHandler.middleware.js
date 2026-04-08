// src/middleware/errorHandler.middleware.js
import { config } from '../config/env.js'

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  if (config.NODE_ENV === 'development') {
    console.error('[ERROR]', err.stack)
  }

  if (config.NODE_ENV === 'production' && statusCode >= 500) {
    console.error('[ERROR]', message, req.method, req.path)
  }

  // Prisma: record not found
  if (err.code === 'P2025') {
    return res.status(404).json({ success: false, error: 'Resource not found' })
  }

  // Prisma: unique constraint violation
  if (err.code === 'P2002') {
    return res.status(409).json({ success: false, error: 'Resource already exists' })
  }

  return res.status(statusCode).json({
    success: false,
    error: message,
    ...(config.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
