import React, { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, Loader } from 'lucide-react';
import api from '../../services/api';

export default function CreditHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCreditHistory();
  }, []);

  const fetchCreditHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payments/credit-history');
      setHistory(response.data.creditLogs);
      setError(null);
    } catch (err) {
      setError('Failed to load credit history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'INITIAL_SIGNUP':
        return { bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-500' };
      case 'CHAT_USED':
        return { bg: 'bg-red-50', text: 'text-red-700', icon: 'text-red-500' };
      case 'PURCHASE':
        return { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-500' };
      case 'REFUND':
        return { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: 'text-yellow-500' };
      case 'MONTHLY_RESET':
        return { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'text-purple-500' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-700', icon: 'text-gray-500' };
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      INITIAL_SIGNUP: 'Welcome Bonus',
      CHAT_USED: 'Chat Generation',
      PURCHASE: 'Credit Purchase',
      REFUND: 'Refund',
      MONTHLY_RESET: 'Monthly Reset',
    };
    return labels[type] || type;
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

      {history.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No transaction history yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((log) => {
            const colors = getTypeColor(log.type);
            const isIncome = log.amount > 0;

            return (
              <div
                key={log.id}
                className={`${colors.bg} border border-gray-200 rounded-lg p-4 flex items-center justify-between`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`${colors.icon} p-2 rounded-full bg-white`}
                  >
                    {isIncome ? (
                      <ArrowDown className="w-4 h-4" />
                    ) : (
                      <ArrowUp className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className={`font-semibold ${colors.text}`}>
                      {getTypeLabel(log.type)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {log.reason || formatDate(log.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`font-bold text-lg ${
                      isIncome ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {isIncome ? '+' : '-'}{Math.abs(log.amount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(log.createdAt)}
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
