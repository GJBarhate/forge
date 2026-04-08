// src/services/payment.service.js
import { prisma } from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import Razorpay from 'razorpay';
import { config } from '../config/env.js';
import crypto from 'crypto';

let razorpay = null;

function getRazorpay() {
  if (!razorpay) {
    if (!config.RAZORPAY_KEY_ID || !config.RAZORPAY_KEY_SECRET) {
      console.error('❌ Razorpay keys not found:', {
        KEY_ID: !!config.RAZORPAY_KEY_ID,
        KEY_SECRET: !!config.RAZORPAY_KEY_SECRET,
      });
      throw new ApiError(500, 'Razorpay keys not configured in environment');
    }
    try {
      razorpay = new Razorpay({
        key_id: config.RAZORPAY_KEY_ID,
        key_secret: config.RAZORPAY_KEY_SECRET,
      });
      console.log('✅ Razorpay initialized successfully');
    } catch (err) {
      console.error('❌ Failed to initialize Razorpay:', err.message);
      throw new ApiError(500, `Failed to initialize Razorpay: ${err.message}`);
    }
  }
  return razorpay;
}

// Credit packages: { name, credits, price_in_paise }
export const CREDIT_PACKAGES = {
  starter: { credits: 10, amount: 19900, name: 'Starter (10 Credits)' },      // ₹199
  pro: { credits: 50, amount: 99900, name: 'Pro (50 Credits)' },              // ₹999
  enterprise: { credits: 100, amount: 179900, name: 'Enterprise (100 Credits)' }, // ₹1799
};

/**
 * Create Razorpay order for credit purchase
 */
export async function createPaymentOrder(userId, packageKey) {
  console.log('🔵 createPaymentOrder called with:', { userId, packageKey });
  
  if (!userId) {
    throw new ApiError(400, 'User ID is required');
  }

  const creditPackage = CREDIT_PACKAGES[packageKey];
  if (!creditPackage) {
    throw new ApiError(400, `Invalid package: ${packageKey}`);
  }

  try {
    console.log('🔵 Fetching user:', userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    console.log('✅ User found:', user.email);

    // Create Razorpay order
    try {
      console.log('🔵 Getting Razorpay instance...');
      const razorpayInstance = getRazorpay();
      console.log('✅ Razorpay instance obtained');
      
      const orderOptions = {
        amount: creditPackage.amount, // in paise
        currency: 'INR',
        receipt: `rcpt_${Date.now()}_${userId}`.substring(0, 40), // Max 40 chars, alphanumeric
        notes: {
          userId: user.id,
          email: user.email,
          credits: creditPackage.credits,
        },
      };
      
      console.log('🔵 Creating order with options:', JSON.stringify(orderOptions, null, 2));
      const order = await razorpayInstance.orders.create(orderOptions);

      console.log('✅ Razorpay order created successfully:', {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
      });

      // Save pending payment to database
      const payment = await prisma.payment.create({
        data: {
          userId: user.id,
          razorpayOrderId: order.id,
          amount: creditPackage.amount,
          creditsToAdd: creditPackage.credits,
          status: 'PENDING',
        },
      });

      console.log('✅ Payment record created:', payment.id);

      return {
        orderId: order.id,
        amount: creditPackage.amount,
        credits: creditPackage.credits,
        currency: 'INR',
        userEmail: user.email,
        userName: user.name,
      };
    } catch (razorpayErr) {
      console.error('❌ FULL RAZORPAY ERROR OBJECT:', JSON.stringify(razorpayErr, null, 2));
      console.error('❌ Error properties:');
      console.error('   - message:', razorpayErr.message);
      console.error('   - statusCode:', razorpayErr.statusCode);
      console.error('   - description:', razorpayErr.description);
      console.error('   - code:', razorpayErr.code);
      if (razorpayErr.error) {
        console.error('   - error object:', JSON.stringify(razorpayErr.error, null, 2));
      }
      if (razorpayErr.response) {
        console.error('   - response:', JSON.stringify(razorpayErr.response, null, 2));
      }
      
      // Extract meaningful error message
      const errorMsg = razorpayErr.description || razorpayErr.message || razorpayErr.error?.description || JSON.stringify(razorpayErr);
      throw new Error(`Razorpay order creation failed: ${errorMsg}`);
    }
  } catch (err) {
    if (err instanceof ApiError) throw err;
    console.error('❌ Payment order creation error:', {
      message: err.message,
      code: err.code,
      statusCode: err.statusCode,
    });
    const errorMessage = err?.message || err?.response?.data?.error?.description || String(err);
    throw new ApiError(500, `Failed to create payment order: ${errorMessage}`);
  }
}

/**
 * Verify Razorpay payment and add credits
 */
export async function verifyAndApplyPayment(userId, razorpayPaymentId, razorpayOrderId, razorpaySignature) {
  console.log('🔵 verifyAndApplyPayment called with:', { userId, razorpayPaymentId, razorpayOrderId });

  // Validate input
  if (!userId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
    console.error('❌ Missing required payment verification fields');
    throw new ApiError(400, 'Missing required payment verification fields');
  }

  // Verify RAZORPAY_KEY_SECRET is configured
  if (!config.RAZORPAY_KEY_SECRET) {
    console.error('❌ RAZORPAY_KEY_SECRET not configured');
    throw new ApiError(500, 'Razorpay secret key not configured');
  }

  try {
    // ── Step 1: Verify signature using HMAC SHA256 ──
    console.log('🔵 Verifying Razorpay signature...');
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    console.log('🔵 Signature comparison:');
    console.log('   - Expected:', expectedSignature);
    console.log('   - Received:', razorpaySignature);

    if (expectedSignature !== razorpaySignature) {
      console.error('❌ Invalid payment signature - mismatch detected');
      throw new ApiError(400, 'Invalid payment signature');
    }
    console.log('✅ Signature verified successfully');

    // ── Step 2: Find payment record in database ──
    console.log('🔵 Finding payment record for order:', razorpayOrderId);
    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId },
    });

    if (!payment) {
      console.error('❌ Payment record not found for order:', razorpayOrderId);
      throw new ApiError(404, 'Payment record not found');
    }
    console.log('✅ Payment record found:', payment.id);

    // ── Step 3: Verify payment belongs to user ──
    console.log('🔵 Verifying payment belongs to user:', userId);
    if (payment.userId !== userId) {
      console.error('❌ Payment does not belong to this user');
      throw new ApiError(403, 'Payment does not belong to this user');
    }
    console.log('✅ Payment verified for user');

    // ── Step 4: Check if payment already processed ──
    if (payment.status === 'SUCCESS') {
      console.warn('⚠️  Payment already processed - returning existing result');
      // Return success even if already processed (idempotent)
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { creditsBalance: true },
      });
      return {
        success: true,
        message: 'Payment already verified successfully',
        creditsAdded: payment.creditsToAdd,
        newBalance: user?.creditsBalance || 0,
      };
    }

    // ── Step 5: Update payment and add credits to user ──
    console.log('🔵 Updating payment status and adding credits...');
    const result = await prisma.$transaction(async (tx) => {
      // Update payment status to SUCCESS
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          razorpayPaymentId,
          status: 'SUCCESS',
        },
      });

      // Add credits to user balance
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          creditsBalance: {
            increment: payment.creditsToAdd,
          },
        },
      });

      // Log the credit addition
      await tx.creditLog.create({
        data: {
          userId,
          type: 'PURCHASE',
          amount: payment.creditsToAdd,
          reason: `Purchased via Razorpay Order ${razorpayOrderId}`,
        },
      });

      return {
        paymentId: updatedPayment.id,
        status: updatedPayment.status,
        creditsAdded: payment.creditsToAdd,
        newBalance: updatedUser.creditsBalance,
      };
    });

    console.log('✅ Payment verification complete:', result);

    return {
      success: true,
      message: 'Payment verified successfully',
      creditsAdded: result.creditsAdded,
      newBalance: result.newBalance,
    };
  } catch (err) {
    console.error('❌ Payment verification error:', {
      message: err.message,
      code: err.code,
      statusCode: err.statusCode,
    });
    
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, `Payment verification failed: ${err.message}`);
  }
}

/**
 * Deduct credit when user uses project Gemini API
 */
export async function deductCredit(userId, reason = 'Chat generation') {
  if (!userId) {
    throw new ApiError(400, 'User ID is required');
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.creditsBalance <= 0) {
      throw new ApiError(402, 'Insufficient credits. Please purchase more credits.');
    }

    // Deduct 1 credit and log it
    const [updatedUser, creditLog] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          creditsBalance: {
            decrement: 1,
          },
        },
      }),
      prisma.creditLog.create({
        data: {
          userId,
          type: 'CHAT_USED',
          amount: -1,
          reason,
        },
      }),
    ]);

    return {
      creditsDeducted: 1,
      remainingCredits: updatedUser.creditsBalance,
    };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, `Failed to deduct credit: ${err.message}`);
  }
}

/**
 * Get user's credit history
 */
export async function getCreditHistory(userId) {
  if (!userId) {
    throw new ApiError(400, 'User ID is required');
  }

  try {
    const logs = await prisma.creditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return logs;
  } catch (err) {
    throw new ApiError(500, `Failed to fetch credit history: ${err.message}`);
  }
}

/**
 * Get user's payment history
 */
export async function getPaymentHistory(userId) {
  if (!userId) {
    throw new ApiError(400, 'User ID is required');
  }

  try {
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return payments;
  } catch (err) {
    throw new ApiError(500, `Failed to fetch payment history: ${err.message}`);
  }
}

/**
 * Get available credit packages
 */
export function getAvailablePackages() {
  return Object.entries(CREDIT_PACKAGES).map(([key, pkg]) => ({
    key,
    ...pkg,
  }));
}
