// src/controllers/payment.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import * as paymentService from '../services/payment.service.js';
import { config } from '../config/env.js';
import { prisma } from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Get Razorpay public key for frontend
 */
export const getRazorpayKey = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    key: config.RAZORPAY_KEY_ID,
  });
});

/**
 * Get available credit packages
 */
export const getPackages = asyncHandler(async (req, res) => {
  const packages = paymentService.getAvailablePackages();
  
  res.status(200).json({
    success: true,
    packages,
  });
});

/**
 * Create a Razorpay payment order
 */
export const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { packageKey } = req.body;

  const orderData = await paymentService.createPaymentOrder(userId, packageKey);

  res.status(201).json({
    success: true,
    ...orderData,
  });
});

/**
 * Verify payment and add credits to user
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

  const result = await paymentService.verifyAndApplyPayment(
    userId,
    razorpayPaymentId,
    razorpayOrderId,
    razorpaySignature
  );

  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * Get user's credit balance
 */
export const getBalance = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { creditsBalance: true },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json({
    success: true,
    data: { creditsBalance: user.creditsBalance },
  });
});

/**
 * Get user's credit history
 */
export const getCreditHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const creditLogs = await paymentService.getCreditHistory(userId);

  res.status(200).json({
    success: true,
    creditLogs,
  });
});

/**
 * Get user's payment history
 */
export const getPaymentHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const payments = await paymentService.getPaymentHistory(userId);

  res.status(200).json({
    success: true,
    payments,
  });
});
