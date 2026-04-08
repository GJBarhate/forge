// src/routes/audio.routes.js
import { Router } from 'express'
import multer from 'multer'
import { authenticate } from '../middleware/auth.middleware.js'
import { aiRateLimiter } from '../middleware/rateLimiter.middleware.js'
import { transcribe } from '../controllers/audio.controller.js'

const router = Router()

// multer: memory storage, 25 MB max, audio only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true)
    } else {
      cb(new Error('Only audio files are accepted'), false)
    }
  },
})

// POST /api/v1/audio/transcribe
router.post(
  '/transcribe',
  authenticate,
  aiRateLimiter,
  upload.single('audio'),
  transcribe
)

export default router
