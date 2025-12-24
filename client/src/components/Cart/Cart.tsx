import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/helpers';

interface CartProps {
  onClose?: () => void;
}

const Cart: React.FC<CartProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  const handleCheckout = () => {
    if (onClose) onClose();
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Cart</h2>
          {onClose && (
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          )}
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">Your cart is empty</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Your Cart</h2>
          {onClose && (
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {cart.map((item) => (
          <div key={item._id} className="flex items-center gap-4 mb-4 pb-4 border-b">
            <div className="flex-1">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-sm text-gray-600">{formatPrice(item.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300"
              >
                -
              </button>
              <span className="w-8 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300"
              >
                +
              </button>
            </div>
            <button
              onClick={() => removeFromCart(item._id)}
              className="text-red-500 hover:text-red-700"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      <div className="p-6 border-t bg-gray-50">
        <div className="flex justify-between mb-4">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-xl font-bold text-blue-600">
            {formatPrice(getCartTotal())}
          </span>
        </div>
        <button
          onClick={clearCart}
          className="w-full mb-2 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
        >
          Clear Cart
        </button>
        <button
          onClick={handleCheckout}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;