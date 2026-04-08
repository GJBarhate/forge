// src/middleware/requestLogger.middleware.js
import morgan from 'morgan'
import { config } from '../config/env.js'

export const requestLogger =
  config.NODE_ENV === 'development'
    ? morgan('dev')
    : morgan('combined')
