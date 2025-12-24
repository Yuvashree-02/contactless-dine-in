import React, { useState } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

interface PaymentGatewayProps {
  orderId: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ orderId, amount, onSuccess, onCancel }) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const paymentMethods = [
    { id: 'upi', name: 'UPI', icon: '📱' },
    { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
    { id: 'netbanking', name: 'Net Banking', icon: '🏦' },
    { id: 'wallet', name: 'Digital Wallet', icon: '👛' }
  ];

  const handlePayment = async () => {
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create payment intent
      const paymentIntent = await api.post('/payment/create-payment-intent', {
        orderId,
        amount
      });

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify payment
      await api.post('/payment/verify-payment', {
        orderId,
        paymentId: paymentIntent.data.paymentId,
        paymentMethod: selectedMethod
      });

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Complete Payment</h2>
          <p className="text-3xl font-bold text-blue-600 mt-2">₹{amount.toFixed(2)}</p>
        </div>

        <div className="space-y-3 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Select Payment Method</p>
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                selectedMethod === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <span className="text-2xl">{method.icon}</span>
              <span className="font-medium text-gray-800">{method.name}</span>
              {selectedMethod === method.id && (
                <span className="ml-auto text-blue-500">✓</span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={loading || !selectedMethod}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Processing...
              </span>
            ) : (
              'Pay Now'
            )}
          </button>
        </div>

        <p className="text-sm text-gray-600 text-center mt-4">
          🔒 Secure payment gateway • Your order will be sent to the kitchen after successful payment
        </p>
      </div>
    </div>
  );
};

export default PaymentGateway;
