import React, { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Zap, Check, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function CreditPackages({ onPurchaseSuccess }) {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const initializePromiseRef = useRef(null);

  // Fetch packages with React Query caching (1 hour stale time)
  const { data: packageData = [], isLoading } = useQuery({
    queryKey: ['creditPackages'],
    queryFn: async () => {
      const response = await api.get('/payments/packages');
      return response.data.packages || [];
    },
    staleTime: 60 * 60 * 1000, // ✅ Cache for 1 hour
    gcTime: 2 * 60 * 60 * 1000, // ✅ Garbage collect after 2 hours
    refetchOnWindowFocus: false, // ✅ Don't refetch on window focus
  });

  // Initialize Razorpay once and reuse
  const initializeRazorpay = () => {
    if (initializePromiseRef.current) {
      return initializePromiseRef.current;
    }

    initializePromiseRef.current = new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

    return initializePromiseRef.current;
  };

  useEffect(() => {
    initializeRazorpay();
  }, []);

  const handlePurchase = async (packageKey) => {
    if (processingOrder) return;

    try {
      setProcessingOrder(packageKey);
      // ✅ CLEAR BOTH ERROR AND SUCCESS AT START
      setError(null);
      setSuccess(null);
      console.log('🔵 Clearing error and success states');

      // Create Razorpay order
      const orderResponse = await api.post('/payments/create-order', {
        packageKey,
      });

      const { orderId, amount, currency, credits, name } = orderResponse.data;
      console.log('✅ Order created:', orderId);

      // Get Razorpay key from backend
      const keyResponse = await api.get('/payments/razorpay-key');
      const razorpayKey = keyResponse.data.key;

      // Open Razorpay checkout
      const options = {
        key: razorpayKey,
        amount: amount,
        currency: currency,
        name: 'Forge AI',
        description: `Purchase ${credits} Credits`,
        order_id: orderId,
        handler: async (response) => {
          console.log('🔵 Razorpay handler called');
          console.log('🔵 Payment response:', {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
          });

          try {
            // Verify payment on backend
            console.log('🔵 Sending verification request to backend...');
            const verifyResponse = await api.post('/payments/verify', {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });

            console.log('✅ Verification response received:', verifyResponse.data);

            // ✅ FIRST: Check response status
            if (!verifyResponse.data.success) {
              console.error('❌ Verification failed:', verifyResponse.data);
              setError(verifyResponse.data.message || 'Payment verification failed');
              setSuccess(null);
              return;
            }

            // ✅ SECOND: Clear error banner immediately
            setError(null);
            console.log('✅ Error banner cleared');

            // ✅ THIRD: Update balance
            const newBalance = verifyResponse.data.newBalance;
            console.log('💰 New balance:', newBalance);
            if (newBalance !== undefined) {
              updateUser({ creditsBalance: newBalance });
              console.log('✅ User balance updated');
            }

            // ✅ FOURTH: Show success message
            const successMsg = `✅ Payment successful! ${verifyResponse.data.creditsAdded} credits added.`;
            setSuccess(successMsg);
            console.log('✅ Success message displayed:', successMsg);

            // ✅ FIFTH: Call callback
            if (onPurchaseSuccess) {
              onPurchaseSuccess(verifyResponse.data);
            }

            // ✅ SIXTH: Auto-hide success after 5 seconds
            setTimeout(() => {
              setSuccess(null);
              console.log('⏱️ Success message auto-hidden');
            }, 5000);
          } catch (err) {
            console.error('❌ Verification error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Payment verification failed';
            setError(errorMsg);
            setSuccess(null);
          }
        },
        prefill: {
          email: user?.email,
          name: user?.name,
        },
        theme: {
          color: '#3b82f6',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

      razorpay.on('payment.failed', (response) => {
        console.error('❌ Razorpay payment.failed event triggered');
        setError('Payment failed. Please try again.');
        setSuccess(null);
      });
    } catch (err) {
      console.error('❌ Order creation failed:', err);
      setError(err.response?.data?.message || 'Failed to create order');
      setSuccess(null);
    } finally {
      setProcessingOrder(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Balance */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Available Credits</p>
            <h2 className="text-4xl font-bold mt-1">{user?.creditsBalance || 0}</h2>
          </div>
          <Zap className="w-12 h-12 opacity-80" />
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {packageData.map((pkg) => (
          <div
            key={pkg.key}
            className={`rounded-lg border-2 p-6 transition-all ${
              selectedPackage === pkg.key
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Popular Badge */}
            {pkg.key === 'pro' && (
              <div className="mb-4">
                <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
                  POPULAR
                </span>
              </div>
            )}

            {/* Package Name */}
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {pkg.name}
            </h3>

            {/* Price */}
            <p className="text-3xl font-bold text-gray-900 mb-1">
              ₹{(pkg.amount / 100).toFixed(0)}
            </p>
            <p className="text-gray-500 text-sm mb-4">
              {pkg.credits} Credits
            </p>

            {/* Features */}
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                {pkg.credits} AI Generations
              </li>
              <li className="flex items-center text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Valid for 30 days
              </li>
              <li className="flex items-center text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Email support
              </li>
            </ul>

            {/* Button */}
            <button
              onClick={() => {
                setSelectedPackage(pkg.key);
                handlePurchase(pkg.key);
              }}
              disabled={processingOrder !== null}
              className={`w-full py-2 rounded-lg font-semibold transition-all ${
                processingOrder === pkg.key
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : pkg.key === 'pro'
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {processingOrder === pkg.key ? (
                <span className="flex items-center justify-center">
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </span>
              ) : (
                `Buy ${pkg.name}`
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-900 text-sm">
          <strong>💡 Note:</strong> Each AI generation with project Gemini API
          costs 1 credit. Using your personal API key has unlimited generations.
        </p>
      </div>
    </div>
  );
}
