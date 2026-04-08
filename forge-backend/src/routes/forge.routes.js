// src/routes/forge.routes.js
import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { aiRateLimiter } from '../middleware/rateLimiter.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { generateSchema, forkSchema } from '../validators/forge.validator.js'
import {
  generate,
  fork,
  getJobStatus,
} from '../controllers/forge.controller.js'

const router = Router()

// POST /api/v1/forge/generate — main AI generation endpoint
router.post('/generate', authenticate, aiRateLimiter, validate(generateSchema), generate)

// POST /api/v1/forge/fork — fork an existing iteration
router.post('/fork', authenticate, validate(forkSchema), fork)

// GET  /api/v1/forge/jobs/:jobId — poll job status
router.get('/jobs/:jobId', authenticate, getJobStatus)

export default router
