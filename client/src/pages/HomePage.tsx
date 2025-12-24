import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRScanner from '../components/QRScanner/QRScanner';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);

  const handleTestTable = () => {
    // For testing purposes, navigate to table 1
    navigate('/table/1');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="text-center p-8 bg-white rounded-2xl shadow-2xl max-w-md">
        <div className="mb-6">
          <svg
            className="w-24 h-24 mx-auto text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Contactless Dine-In
        </h1>
        <p className="text-gray-600 mb-8">
          Scan the QR code on your table to view the menu and place your order safely.
        </p>
        {!showScanner ? (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                📱 Scan QR Code → 🍴 Browse Menu → 🛒 Place Order → ✅ Track Status
              </p>
            </div>
            <button
              onClick={() => setShowScanner(true)}
              className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition duration-200"
            >
              📷 Scan QR Code
            </button>
            <button
              onClick={handleTestTable}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
            >
              Demo: View Menu (Table 1)
            </button>
            <button
              onClick={() => navigate('/admin/login')}
              className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition duration-200"
            >
              Staff Login
            </button>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setShowScanner(false)}
              className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
            >
              ← Back
            </button>
            <QRScanner />
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;