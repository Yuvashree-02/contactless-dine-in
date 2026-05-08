import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderAPI, tableAPI } from '../services/api';
import { formatPrice } from '../utils/helpers';
import PaymentGateway from '../components/Payment/PaymentGateway';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { tableId } = useParams();
  const { cart, getCartTotal, clearCart, tableId: cartTableId } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [tableDisplayLabel, setTableDisplayLabel] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const currentTableId = cartTableId || tableId || localStorage.getItem('tableId') || '1';

  useEffect(() => {
    const fetchTableLabel = async () => {
      try {
        const table = await tableAPI.getById(currentTableId);
        setTableDisplayLabel(String(table.tableNumber || table.tableCode || currentTableId));
      } catch {
        setTableDisplayLabel(currentTableId);
      }
    };

    fetchTableLabel();
  }, [currentTableId]);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setError('Please enter your name and phone number');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const orderData = {
        tableId: currentTableId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        items: cart.map((item) => ({
          menuItemId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: total,
      };

      const order = await orderAPI.create(orderData);
      setOrderId(order._id);
  localStorage.setItem('activeOrderId', order._id);
  localStorage.setItem(`activeOrderStatus:${order._id}`, order.status);
      setShowPayment(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    // Let the order tracking page show a receipt/feedback prompt
    try {
      localStorage.setItem('receiptSent', 'true');
      localStorage.setItem('recentOrderId', orderId);
    } catch {}
    navigate(`/order/${orderId}`);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  const subtotal = getCartTotal();
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate(`/table/${currentTableId}`)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item._id} className="flex justify-between items-center border-b pb-3">
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-600">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
                <span className="font-semibold">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (5%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-2 border-t">
              <span>Total</span>
              <span className="text-blue-600">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Table Information</h2>
          <p className="text-gray-600">Table Number: <span className="font-semibold">{tableDisplayLabel || currentTableId}</span></p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Enter phone number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => navigate(`/table/${currentTableId}`)}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
          >
            Back to Menu
          </button>
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Placing Order...' : 'Proceed to Payment'}
          </button>
        </div>
      </div>

      {showPayment && (
        <PaymentGateway
          orderId={orderId}
          amount={total}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}
    </div>
  );
};

export default CheckoutPage;