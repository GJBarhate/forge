// src/routes/payment.routes.js
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import * as paymentController from '../controllers/payment.controller.js';
import { z } from 'zod';

const router = Router();

// ── Schema validations ──
const createOrderSchema = z.object({
  packageKey: z.enum(['starter', 'pro', 'enterprise']),
});

const verifyPaymentSchema = z.object({
  razorpayPaymentId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

// ── Public routes (no auth required) ──
router.get('/packages', paymentController.getPackages);
router.get('/razorpay-key', paymentController.getRazorpayKey);

// ── Protected routes (auth required) ──
router.use(authenticate);

/**
 * GET /api/v1/payments/balance
 * Get user's current credit balance
 */
router.get('/balance', paymentController.getBalance);

/**
 * GET /api/v1/payments/credit-history
 * Get user's credit transaction history
 */
router.get('/credit-history', paymentController.getCreditHistory);

/**
 * GET /api/v1/payments/payment-history
 * Get user's payment history
 */
router.get('/payment-history', paymentController.getPaymentHistory);

/**
 * POST /api/v1/payments/create-order
 * Create a new Razorpay payment order
 * Body: { packageKey: 'starter' | 'pro' | 'enterprise' }
 */
router.post(
  '/create-order',
  validate(createOrderSchema),
  paymentController.createOrder
);

/**
 * POST /api/v1/payments/verify
 * Verify Razorpay payment and add credits
 * Body: { razorpayPaymentId, razorpayOrderId, razorpaySignature }
 */
router.post(
  '/verify',
  validate(verifyPaymentSchema),
  paymentController.verifyPayment
);

export default router;
