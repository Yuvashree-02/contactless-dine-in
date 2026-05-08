import React from 'react';
import { useNavigate } from 'react-router-dom';

const PortalPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-6">
      <div className="w-full max-w-4xl bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 md:p-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">Contactless Dine-In</h1>
          <p className="text-slate-600 mt-3">Choose your portal to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate('/user')}
            className="text-left bg-blue-50 border border-blue-200 rounded-2xl p-6 hover:bg-blue-100 transition"
          >
            <p className="text-3xl mb-3">🍽️</p>
            <h2 className="text-2xl font-bold text-blue-900">User End</h2>
            <p className="text-blue-800 mt-2">Scan QR, browse menu, place orders, and track order status.</p>
            <p className="mt-4 text-blue-700 font-semibold">Open User Portal →</p>
          </button>

          <button
            onClick={() => navigate('/staff/login')}
            className="text-left bg-slate-100 border border-slate-300 rounded-2xl p-6 hover:bg-slate-200 transition"
          >
            <p className="text-3xl mb-3">🧑‍🍳</p>
            <h2 className="text-2xl font-bold text-slate-900">Staff End</h2>
            <p className="text-slate-700 mt-2">Login to manage orders, menu items, and table operations.</p>
            <p className="mt-4 text-slate-800 font-semibold">Open Staff Portal →</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortalPage;
