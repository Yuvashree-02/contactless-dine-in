import React, { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import { Order } from '../types';

interface DailySales {
  date: string;
  totalRevenue: number;
  orderCount: number;
  paidOrders: number;
}

interface StatusSummary {
  _id: string;
  count: number;
  totalAmount: number;
}

interface TopItem {
  _id: string;
  totalQuantity: number;
  totalRevenue: number;
}

const HotelAdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [statusSummary, setStatusSummary] = useState<StatusSummary[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersData, salesData, statusData, itemsData] = await Promise.all([
        orderAPI.getAllOrders(),
        orderAPI.getDailySalesAnalytics(startDate, endDate),
        orderAPI.getOrderStatusSummary(),
        orderAPI.getTopMenuItems(),
      ]);

      setOrders(ordersData);
      setDailySales(salesData);
      setStatusSummary(statusData);
      setTopItems(itemsData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterByDate = () => {
    fetchDashboardData();
  };

  // Calculate totals
  const totalRevenue = dailySales.reduce((sum, day) => sum + day.totalRevenue, 0);
  const totalOrders = orders.length;
  const totalPaid = orders.filter(o => o.paymentStatus === 'Paid').length;
  const totalPending = orders.filter(o => o.paymentStatus === 'Pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">Hotel Admin Dashboard</h1>
          <p className="text-gray-600">Sales analytics and order management</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">₹{totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Orders</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{totalOrders}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Paid Orders</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">{totalPaid}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Pending Payments</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{totalPending}</p>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Filter by Date Range</h2>
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={handleFilterByDate}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Apply Filter
            </button>
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                fetchDashboardData();
              }}
              className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Daily Sales Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Daily Sales Trend</h2>
          {dailySales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Date</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700">Revenue</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700">Orders</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700">Paid</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700">Avg per Order</th>
                  </tr>
                </thead>
                <tbody>
                  {dailySales.map((day) => (
                    <tr key={day.date} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{day.date}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600">
                        ₹{day.totalRevenue.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">{day.orderCount}</td>
                      <td className="px-4 py-3 text-right">{day.paidOrders}</td>
                      <td className="px-4 py-3 text-right">
                        ₹{(day.totalRevenue / day.orderCount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">No sales data available</p>
          )}
        </div>

        {/* Order Status Summary & Top Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Order Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Status Summary</h2>
            {statusSummary.length > 0 ? (
              <div className="space-y-3">
                {statusSummary.map((status) => (
                  <div key={status._id} className="flex items-center justify-between border-b pb-3">
                    <span className="font-medium text-gray-700">{status._id}</span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{status.count}</p>
                      <p className="text-sm text-gray-600">₹{status.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No order data available</p>
            )}
          </div>

          {/* Top Menu Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Top 10 Menu Items</h2>
            {topItems.length > 0 ? (
              <div className="space-y-3">
                {topItems.map((item, index) => (
                  <div key={item._id} className="flex items-center justify-between border-b pb-3">
                    <span className="font-medium text-gray-700">
                      {index + 1}. {item._id}
                    </span>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{item.totalQuantity}x</p>
                      <p className="text-sm text-gray-600">₹{item.totalRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No item data available</p>
            )}
          </div>
        </div>

        {/* Order History */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Order History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Order ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Table</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Customer</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Payment</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 20).map((order) => (
                  <tr key={order._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{String(order._id).slice(-8)}</td>
                    <td className="px-4 py-3">{order.tableId}</td>
                    <td className="px-4 py-3">{order.customerName}</td>
                    <td className="px-4 py-3 text-right font-semibold">₹{order.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          order.status === 'Served'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'Ready'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'In Kitchen'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          order.paymentStatus === 'Paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders.length > 20 && (
            <p className="text-sm text-gray-600 mt-4">Showing 20 of {orders.length} orders</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelAdminDashboard;
