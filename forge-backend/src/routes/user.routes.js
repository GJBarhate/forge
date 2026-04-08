// src/routes/user.routes.js
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import * as userController from '../controllers/user.controller.js';
import { z } from 'zod';

const router = Router();

// ── Schema validations ──
const updateGeminiKeySchema = z.object({
  geminiApiKey: z.string().optional().nullable(),
});

const updateProfileSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional().nullable(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

// ── Protect all routes with auth middleware ──
router.use(authenticate);

// GET /api/v1/users/profile
router.get('/profile', userController.getProfile);

// PATCH /api/v1/users/gemini-key
router.patch(
  '/gemini-key',
  validate(updateGeminiKeySchema),
  userController.updateGeminiKey
);

// PATCH /api/v1/users/profile
router.patch(
  '/profile',
  validate(updateProfileSchema),
  userController.updateProfile
);

// PATCH /api/v1/users/change-password
router.patch(
  '/change-password',
  validate(changePasswordSchema),
  userController.changePassword
);

export default router;
