// src/routes/auth.routes.js
import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { authRateLimiter } from '../middleware/rateLimiter.middleware.js'  // ✅ ADDED
import { registerSchema, loginSchema } from '../validators/auth.validator.js'
import {
  register,
  login,
  refresh,
  logout,
  me,
} from '../controllers/auth.controller.js'

const router = Router()

// ✅ Apply auth rate limiter to login/register (5 attempts per 15 minutes)
router.post('/register', authRateLimiter, validate(registerSchema), register)

// ✅ Apply auth rate limiter to login
router.post('/login', authRateLimiter, validate(loginSchema), login)

// GET  /api/v1/auth/refresh  — reads HttpOnly cookie
router.get('/refresh', refresh)

// POST /api/v1/auth/logout   — requires valid access token
router.post('/logout', authenticate, logout)

// GET  /api/v1/auth/me       — returns current user
router.get('/me', authenticate, me)

export default router
