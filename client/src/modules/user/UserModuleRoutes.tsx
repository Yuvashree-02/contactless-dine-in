import React from 'react';
import { Navigate, Route } from 'react-router-dom';

import PortalPage from '../../pages/PortalPage';
import HomePage from '../../pages/HomePage';
import MenuPage from '../../pages/MenuPage';
import CheckoutPage from '../../pages/CheckoutPage';
import OrderTrackingPage from '../../pages/OrderTrackingPage';
import FeedbackPage from '../../pages/FeedbackPage';

export const userModuleRoutes = (
  <>
    <Route path="/" element={<PortalPage />} />
    <Route path="/user" element={<HomePage />} />
    <Route path="/table/:tableId" element={<MenuPage />} />
    <Route path="/checkout" element={<CheckoutPage />} />
    <Route path="/order/:orderId" element={<OrderTrackingPage />} />
    <Route path="/feedback" element={<FeedbackPage />} />

    {/* Backward-compatible alias that keeps old and new user entries connected. */}
    <Route path="/user/home" element={<Navigate to="/user" replace />} />
  </>
);
