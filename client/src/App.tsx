import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import LiveOrderNotifier from './components/Order/LiveOrderNotifier';
import { userModuleRoutes } from './modules/user';
import { staffModuleRoutes } from './modules/staff';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <LiveOrderNotifier />
            <Routes>
              {/* Staff module (independent) */}
              {staffModuleRoutes}

              {/* User module (independent) */}
              {userModuleRoutes}

              {/* Backward-compatibility redirects for legacy admin URLs */}
              <Route path="/admin/login" element={<Navigate to="/staff/login" replace />} />
              <Route path="/admin/menu" element={<Navigate to="/staff/menu" replace />} />
              <Route path="/admin/tables" element={<Navigate to="/staff/tables" replace />} />
              <Route path="/admin" element={<Navigate to="/staff" replace />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;