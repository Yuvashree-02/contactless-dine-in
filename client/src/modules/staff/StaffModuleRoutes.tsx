import React from 'react';
import { Navigate, Route } from 'react-router-dom';

import AdminLoginPage from '../../pages/AdminLoginPage';
import AdminDashboard from '../../pages/AdminDashboard';
import AdminMenuPage from '../../pages/AdminMenuPage';
import AdminTableManagementPage from '../../pages/AdminTableManagementPage';
import HotelAdminDashboard from '../../pages/HotelAdminDashboard';
import StaffRouteGuard from './StaffRouteGuard';

export const staffModuleRoutes = (
  <>
    <Route path="/staff/login" element={<AdminLoginPage />} />
    <Route
      path="/staff"
      element={
        <StaffRouteGuard>
          <AdminDashboard />
        </StaffRouteGuard>
      }
    />
    <Route
      path="/staff/menu"
      element={
        <StaffRouteGuard>
          <AdminMenuPage />
        </StaffRouteGuard>
      }
    />
    <Route
      path="/staff/tables"
      element={
        <StaffRouteGuard>
          <AdminTableManagementPage />
        </StaffRouteGuard>
      }
    />
    <Route
      path="/staff/analytics"
      element={
        <StaffRouteGuard>
          <HotelAdminDashboard />
        </StaffRouteGuard>
      }
    />

    <Route path="/staff/*" element={<Navigate to="/staff/login" replace />} />
  </>
);
