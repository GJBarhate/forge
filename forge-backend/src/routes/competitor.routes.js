// src/routes/competitor.routes.js
import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { aiRateLimiter } from '../middleware/rateLimiter.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { competitorSchema } from '../validators/competitor.validator.js'
import { analyze } from '../controllers/competitor.controller.js'

const router = Router()

// POST /api/v1/competitor/analyze
router.post('/analyze', authenticate, aiRateLimiter, validate(competitorSchema), analyze)

export default router
