import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/api';

const ACTIVE_ORDER_KEY = 'activeOrderId';

const LiveOrderNotifier: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  // Keep staff pages clean; notifications are user-side only.
  const isStaffPath = location.pathname.startsWith('/admin') || location.pathname.startsWith('/staff');

  useEffect(() => {
    if (isStaffPath) {
      return;
    }

    const maybeNotify = async () => {
      const activeOrderId = localStorage.getItem(ACTIVE_ORDER_KEY);
      if (!activeOrderId) {
        return;
      }

      try {
        const order = await orderAPI.getById(activeOrderId);
        const statusKey = `activeOrderStatus:${activeOrderId}`;
        const previousStatus = localStorage.getItem(statusKey);

        if (previousStatus && previousStatus !== order.status) {
          const nextMessage = `Your order is now ${order.status}`;
          setMessage(nextMessage);
          setVisible(true);

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Order Update', { body: nextMessage });
          }
        }

        localStorage.setItem(statusKey, order.status);
      } catch {
        // Keep silent if order is not available.
      }
    };

    maybeNotify();
    const interval = setInterval(maybeNotify, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [isStaffPath]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => undefined);
    }
  }, []);

  if (isStaffPath || !visible || !message) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-sm bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg shadow-lg">
      <div className="flex items-start gap-3">
        <div className="text-xl">🔔</div>
        <div className="flex-1">
          <p className="font-semibold">Order Updated</p>
          <p className="text-sm mt-1">{message}</p>
          <button
            onClick={() => navigate(`/order/${localStorage.getItem(ACTIVE_ORDER_KEY)}`)}
            className="text-sm mt-2 text-green-900 underline"
          >
            Open tracking page
          </button>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-green-800 font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default LiveOrderNotifier;
