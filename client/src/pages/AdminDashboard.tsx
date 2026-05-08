import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Order, Table } from '../types';
import { orderAPI, tableAPI } from '../services/api';
import { formatPrice, formatDate, getStatusColor } from '../utils/helpers';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tableCodeMap, setTableCodeMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/staff/login');
      return;
    }
    fetchOrders();
    fetchTableMap();
    const interval = setInterval(fetchOrders, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [filter, isAuthenticated]);

  const fetchTableMap = async () => {
    try {
      const tables: Table[] = await tableAPI.getAll();
      const map = tables.reduce<Record<string, string>>((acc, table) => {
        acc[table._id] = table.tableCode;
        acc[table.tableCode] = table.tableCode;
        return acc;
      }, {});
      setTableCodeMap(map);
    } catch (error) {
      console.error('Failed to fetch tables', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const filterStatus = filter === 'all' ? undefined : filter;
      const data = await orderAPI.getAll(filterStatus);
      // Filter out pending payment orders - only show paid orders
      const paidOrders = data.filter((order: Order) => order.paymentStatus === 'Paid');
      setOrders(paidOrders);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      fetchOrders();
    } catch (error) {
      alert('Failed to update order status');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/staff/login');
  };

  const statuses = ['Received', 'In Kitchen', 'Ready', 'Served'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.username}</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/staff/analytics')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                📊 Sales Analytics
              </button>
              <button
                onClick={() => navigate('/staff/tables')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                📋 Manage Tables
              </button>
              <button
                onClick={() => navigate('/staff/menu')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                🍴 Manage Menu
              </button>
              <button
                onClick={handleLogout}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              All Orders
            </button>
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                  filter === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No orders found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">Table {tableCodeMap[order.tableId] || order.tableId}</h3>
                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                    <p className="text-sm text-gray-700 mt-1">
                      Customer: <span className="font-medium">{order.customerName}</span> ({order.customerPhone})
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-white text-sm ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="border-t pt-4 mb-4">
                  <h4 className="font-semibold mb-2">Items:</h4>
                  <ul className="space-y-1 text-sm">
                    {order.items.map((item, index) => (
                      <li key={index} className="flex justify-between">
                        <span>{item.name} × {item.quantity}</span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-blue-600">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>

                {order.status !== 'Served' && (
                  <div className="flex gap-2">
                    {statuses
                      .slice(statuses.indexOf(order.status) + 1)
                      .map((status) => (
                        <button
                          key={status}
                          onClick={() => handleUpdateStatus(order._id, status)}
                          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm"
                        >
                          Mark as {status}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
