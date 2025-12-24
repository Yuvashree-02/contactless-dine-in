import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { MenuItem } from '../types';
import { menuAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';
import Cart from '../components/Cart/Cart';

const MenuPage: React.FC = () => {
  const { tableId: paramTableId } = useParams<{ tableId: string }>();
  const [searchParams] = useSearchParams();
  const tableIdFromQuery = searchParams.get('table');
  const tableId = tableIdFromQuery || paramTableId;
  
  const { addToCart, cart, setTableId: setCartTableId } = useCart();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [categories, setCategories] = useState<string[]>([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    fetchMenu();
    fetchCategories();
    
    // Set table ID in cart context if available
    if (tableId && setCartTableId) {
      setCartTableId(tableId);
    }
  }, [tableId, setCartTableId]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const data = await menuAPI.getAll();
      setMenuItems(data);
    } catch (err) {
      setError('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await menuAPI.getCategories();
      setCategories(['All', ...data]);
    } catch (err) {
      console.error('Failed to load categories');
    }
  };

  const filteredItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchMenu}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Menu</h1>
              <p className="text-sm text-gray-600">Table {tableId}</p>
            </div>
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Cart ({cart.length})
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white shadow-sm py-3 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
          <div className="flex space-x-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      item.isVeg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-blue-600">
                    {formatPrice(item.price)}
                  </span>
                  <button
                    onClick={() => addToCart(item)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowCart(false)}>
          <div
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Cart onClose={() => setShowCart(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;