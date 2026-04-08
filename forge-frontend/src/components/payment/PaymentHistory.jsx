import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, AlertCircle, Loader } from 'lucide-react';
import api from '../../services/api';

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payments/payment-history');
      setPayments(response.data.payments);
      setError(null);
    } catch (err) {
      setError('Failed to load payment history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS':
        return { bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-500' };
      case 'PENDING':
        return { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: 'text-yellow-500' };
      case 'FAILED':
        return { bg: 'bg-red-50', text: 'text-red-700', icon: 'text-red-500' };
      case 'CANCELLED':
        return { bg: 'bg-gray-50', text: 'text-gray-700', icon: 'text-gray-500' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-700', icon: 'text-gray-500' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-5 h-5" />;
      case 'PENDING':
        return <Clock className="w-5 h-5" />;
      case 'FAILED':
      case 'CANCELLED':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {payments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No payment history yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {payments.map((payment) => {
            const colors = getStatusColor(payment.status);

            return (
              <div
                key={payment.id}
                className={`${colors.bg} border border-gray-200 rounded-lg p-4 flex items-center justify-between`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`${colors.icon} p-2 rounded-full bg-white`}>
                    {getStatusIcon(payment.status)}
                  </div>

                  <div className="flex-1">
                    <p className={`font-semibold ${colors.text}`}>
                      {payment.creditsToAdd} Credits Purchase
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Order ID: {payment.razorpayOrderId.substring(0, 16)}...
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(payment.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-lg text-gray-900">
                    ₹{(payment.amount / 100).toFixed(0)}
                  </p>
                  <p className={`text-xs font-semibold ${colors.text}`}>
                    {payment.status}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
