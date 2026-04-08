import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import CreditPackages from '../components/payment/CreditPackages';
import CreditHistory from '../components/payment/CreditHistory';
import PaymentHistory from '../components/payment/PaymentHistory';
import { Zap, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function CreditsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  // Fetch user profile with React Query caching (5 minute stale time)
  const { data: userData, isRefetching, refetch } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await api.get('/users/profile');
      return response.data.user;
    },
    staleTime: 5 * 60 * 1000, // ✅ Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // ✅ Garbage collect after 10 minutes
    refetchOnWindowFocus: false, // ✅ Don't refetch when window regains focus
  });

  // Update store when userData changes
  useEffect(() => {
    if (userData) {
      updateUser(userData);
    }
  }, [userData, updateUser]);

  const handlePurchaseSuccess = () => {
    // Invalidate profile cache after purchase
    queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    // Also refresh UI components
    setRefreshKey((prev) => prev + 1);
  };

  const handleRefreshClick = async () => {
    // Manual refresh with refetch
    await refetch();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-3 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Credits & Billing</h1>
                <p className="text-gray-600 mt-1">
                  Manage your credits and purchase packages to continue using Forge AI
                </p>
              </div>
            </div>
            <button
              onClick={handleRefreshClick}
              disabled={isRefetching}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
              title="Refresh profile and credits"
            >
              <RefreshCw className={`w-5 h-5 ${isRefetching ? 'animate-spin' : ''}`} />
              {isRefetching ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="packages" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-fit">
            <TabsTrigger value="packages">Buy Credits</TabsTrigger>
            <TabsTrigger value="credit-history">Usage History</TabsTrigger>
            <TabsTrigger value="payment-history">Payments</TabsTrigger>
          </TabsList>

          {/* Buy Credits Tab */}
          <TabsContent value="packages">
            <div className="bg-white rounded-lg shadow p-6">
              <CreditPackages key={refreshKey} onPurchaseSuccess={handlePurchaseSuccess} />
            </div>
          </TabsContent>

          {/* Credit History Tab */}
          <TabsContent value="credit-history">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">Credit Usage History</h2>
                <p className="text-gray-600 text-sm mt-1">
                  View all your credit transactions and usage
                </p>
              </div>
              <CreditHistory key={refreshKey} />
            </div>
          </TabsContent>

          {/* Payment History Tab */}
          <TabsContent value="payment-history">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">Payment History</h2>
                <p className="text-gray-600 text-sm mt-1">
                  View all your credit purchases and transactions
                </p>
              </div>
              <PaymentHistory key={refreshKey} />
            </div>
          </TabsContent>
        </Tabs>

        {/* FAQ Section */}
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>

          <div className="space-y-4">
            <details className="border-b pb-4">
              <summary className="cursor-pointer font-semibold text-gray-900 hover:text-blue-600">
                How many credits do I get as a new user?
              </summary>
              <p className="mt-3 text-gray-600">
                All new users receive 20 free credits upon registration. These credits can be
                used to generate content with the project Gemini API.
              </p>
            </details>

            <details className="border-b pb-4">
              <summary className="cursor-pointer font-semibold text-gray-900 hover:text-blue-600">
                How much does each generation cost?
              </summary>
              <p className="mt-3 text-gray-600">
                Each content generation using the project Gemini API costs 1 credit. If you use
                your personal Gemini API key, generations are unlimited and cost 0 credits.
              </p>
            </details>

            <details className="border-b pb-4">
              <summary className="cursor-pointer font-semibold text-gray-900 hover:text-blue-600">
                What happens when I run out of credits?
              </summary>
              <p className="mt-3 text-gray-600">
                When your credits reach zero, you can no longer use the project Gemini API for
                generations. You can either purchase more credits or use your personal API key
                for unlimited generations.
              </p>
            </details>

            <details className="border-b pb-4">
              <summary className="cursor-pointer font-semibold text-gray-900 hover:text-blue-600">
                Can I get a refund for unused credits?
              </summary>
              <p className="mt-3 text-gray-600">
                Credits purchased are non-refundable. However, unused credits remain valid for
                30 days from purchase. If you believe there's an issue, please contact our
                support team.
              </p>
            </details>

            <details className="pb-4">
              <summary className="cursor-pointer font-semibold text-gray-900 hover:text-blue-600">
                Is my personal API key secure?
              </summary>
              <p className="mt-3 text-gray-600">
                Yes! Your personal Gemini API key is encrypted and stored securely in our
                database. It's never transmitted to untrusted third parties and is only used
                for your AI generations.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
