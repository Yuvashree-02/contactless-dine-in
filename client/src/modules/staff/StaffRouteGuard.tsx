import React from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

interface StaffRouteGuardProps {
  children: React.ReactElement;
}

const StaffRouteGuard: React.FC<StaffRouteGuardProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/staff/login" replace />;
  }

  if (user?.role !== 'admin' && user?.role !== 'staff') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default StaffRouteGuard;
