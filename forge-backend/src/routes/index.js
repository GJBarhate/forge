// src/routes/index.js
import { Router } from 'express'
import authRoutes from './auth.routes.js'
import projectRoutes from './project.routes.js'
import forgeRoutes from './forge.routes.js'
import audioRoutes from './audio.routes.js'
import competitorRoutes from './competitor.routes.js'
import userRoutes from './user.routes.js'
import paymentRoutes from './payment.routes.js'

export const router = Router()

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/payments', paymentRoutes)
router.use('/projects', projectRoutes)
router.use('/forge', forgeRoutes)
router.use('/audio', audioRoutes)
router.use('/competitor', competitorRoutes)
