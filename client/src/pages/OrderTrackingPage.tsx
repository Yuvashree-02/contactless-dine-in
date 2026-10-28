import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { orderAPI, tableAPI } from '../services/api';
import { Order } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const OrderTrackingPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [tableDisplayLabel, setTableDisplayLabel] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [statusNotice, setStatusNotice] = useState<string>('');
    const [streamConnected, setStreamConnected] = useState(false);
    const [error, setError] = useState<string>('');

    const getStatusStorageKey = () => `order:lastStatus:${orderId || ''}`;

    const notifyStatusChange = (newStatus: string) => {
        const notice = `Order status updated to ${newStatus}`;
        setStatusNotice(notice);

        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Order Status Updated', { body: notice });
        }
    };

    const updateStoredStatus = (status: string) => {
        if (!orderId) return;
        localStorage.setItem(getStatusStorageKey(), status);
    };

    const getStoredStatus = () => {
        if (!orderId) return null;
        return localStorage.getItem(getStatusStorageKey());
    };

    const applyOrderUpdate = (updatedOrder: Order) => {
        setOrder((previousOrder) => {
            const storedStatus = getStoredStatus();
            const previousStatus = previousOrder?.status || storedStatus;

            if (previousStatus && previousStatus !== updatedOrder.status) {
                notifyStatusChange(updatedOrder.status);
            }

            updateStoredStatus(updatedOrder.status);
            return updatedOrder;
        });
    };

    const resolveTableLabel = async (tableRef: string) => {
        try {
            const table = await tableAPI.getById(tableRef);
            return String(table.tableNumber || table.tableCode || tableRef);
        } catch {
            return tableRef;
        }
    };

    const fetchOrder = async (isInitialLoad = false) => {
        if (!orderId) return;

        try {
            if (isInitialLoad) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            const order = await orderAPI.getById(orderId);
            applyOrderUpdate(order);

            const label = await resolveTableLabel(order.tableId);
            setTableDisplayLabel(label);
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch order');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrder(true);

        if (!orderId) {
            return;
        }

        const eventSource = new EventSource(`${API_BASE_URL}/orders/stream/${orderId}`);
        eventSource.onopen = () => {
            setStreamConnected(true);
        };

        eventSource.addEventListener('order-update', async (event) => {
            try {
                const updatedOrder = JSON.parse((event as MessageEvent).data) as Order;
                applyOrderUpdate(updatedOrder);

                const label = await resolveTableLabel(updatedOrder.tableId);
                setTableDisplayLabel(label);
            } catch (streamError) {
                console.error('Failed to parse stream update', streamError);
            }
        });

        eventSource.onerror = () => {
            // Polling remains active as fallback.
            setStreamConnected(false);
            eventSource.close();
        };

        // Poll for updates frequently so admin changes appear quickly.
        const interval = setInterval(() => fetchOrder(false), 3000);
        return () => {
            clearInterval(interval);
            setStreamConnected(false);
            eventSource.close();
        };
        // Set up the stream and polling once for the current order.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);

    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().catch(() => undefined);
        }
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
                <div className="text-xl text-gray-600">Loading order details...</div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
                <div className="text-xl text-red-600">{error || 'Order not found'}</div>
            </div>
        );
    }

    // If payment is pending, show different message
    if (order.status === 'Pending Payment' || order.paymentStatus === 'Pending') {
      return (
        <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h1 className="text-2xl font-bold mb-4 text-gray-800">Payment Pending</h1>
            <p className="text-gray-600 mb-6">
              Your order is awaiting payment confirmation. Once payment is completed, 
              your order will be sent to the kitchen.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                Order ID: <span className="font-semibold">{order._id}</span>
              </p>
              <p className="text-sm text-gray-700 mt-2">
                Total: <span className="font-semibold text-xl">₹{order.totalAmount.toFixed(2)}</span>
              </p>
            </div>
          </div>
        </div>
      );
    }

    const statusSteps = ['Received', 'In Kitchen', 'Ready', 'Served'];
    const currentStepIndex = statusSteps.indexOf(order.status);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-3xl font-bold mb-6 text-gray-800">Track Your Order</h1>

                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-gray-500">
                            {refreshing ? 'Checking for status updates...' : 'Auto-refresh every 3 seconds'}
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                            <span
                                className={`w-2.5 h-2.5 rounded-full ${streamConnected ? 'bg-green-500' : 'bg-yellow-500'}`}
                                aria-hidden="true"
                            />
                            <span className={streamConnected ? 'text-green-700' : 'text-yellow-700'}>
                                {streamConnected ? 'Live connected' : 'Fallback mode'}
                            </span>
                        </div>
                        <button
                            onClick={() => fetchOrder(false)}
                            className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
                        >
                            Refresh
                        </button>
                    </div>

                    {statusNotice && (
                        <div className="mb-4 bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded flex items-center justify-between">
                            <span>{statusNotice}</span>
                            <button
                                onClick={() => setStatusNotice('')}
                                className="text-green-800 font-semibold"
                            >
                                ×
                            </button>
                        </div>
                    )}
                    
                    <div className="mb-8">
                        <p className="text-gray-600 mb-2">Order ID: <span className="font-semibold">{order._id}</span></p>
                        <p className="text-gray-600 mb-2">Table: <span className="font-semibold">{tableDisplayLabel || order.tableId}</span></p>
                        <p className="text-gray-600 mb-2">Total: <span className="font-semibold text-xl">₹{order.totalAmount.toFixed(2)}</span></p>
                        <div className="mt-3 flex items-center gap-2">
                            <span className="text-gray-600">Payment Status:</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 
                                order.paymentStatus === 'Failed' ? 'bg-red-100 text-red-800' : 
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                                {order.paymentStatus || 'Pending'}
                            </span>
                        </div>
                        {order.paymentMethod && (
                            <p className="text-gray-600 text-sm mt-1">Payment Method: <span className="font-semibold">{order.paymentMethod}</span></p>
                        )}
                    </div>
                                        {/* Receipt / Feedback prompt after payment */}
                                        {typeof window !== 'undefined' && localStorage.getItem('receiptSent') === 'true' && localStorage.getItem('recentOrderId') === String(order._id) && (
                                            <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium">Receipt sent to your phone</div>
                                                    <div className="text-sm">Thanks for your payment — please rate your experience.</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => { localStorage.removeItem('receiptSent'); window.location.href = `/feedback?orderId=${order._id}`; }} className="bg-blue-600 text-white px-3 py-1 rounded">Give Feedback</button>
                                                    <button onClick={() => { localStorage.removeItem('receiptSent'); localStorage.removeItem('recentOrderId'); }} className="text-blue-600 px-3 py-1">Dismiss</button>
                                                </div>
                                            </div>
                                        )}

                    {/* Status Timeline */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-6">Order Progress</h2>
                        <div className="relative">
                            {/* Progress Line */}
                            <div className="absolute left-4 top-0 bottom-0 w-1 bg-gray-200" style={{ height: 'calc(100% - 40px)' }}>
                                <div 
                                    className="bg-green-500 transition-all duration-500"
                                    style={{ 
                                        height: currentStepIndex >= 0 ? `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` : '0%',
                                        width: '100%'
                                    }}
                                />
                            </div>

                            {statusSteps.map((step, index) => {
                                const stepLabels: { [key: string]: { icon: string; desc: string } } = {
                                    'Received': { icon: '✓', desc: 'Order confirmed and payment received' },
                                    'In Kitchen': { icon: '👨‍🍳', desc: 'Your food is being prepared' },
                                    'Ready': { icon: '🍽️', desc: 'Your order is ready' },
                                    'Served': { icon: '✅', desc: 'Delivered to your table' }
                                };
                                
                                return (
                                    <div key={step} className="flex items-start mb-8 relative">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold z-10 transition-all duration-300 ${
                                            index < currentStepIndex 
                                                ? 'bg-green-500 text-white shadow-lg' 
                                                : index === currentStepIndex
                                                    ? 'bg-blue-500 text-white shadow-xl animate-pulse'
                                                    : 'bg-gray-300 text-gray-600'
                                        }`}>
                                            {index < currentStepIndex ? '✓' : stepLabels[step]?.icon || (index + 1)}
                                        </div>
                                        <div className="ml-6 flex-1">
                                            <p className={`font-bold text-lg ${
                                                index === currentStepIndex 
                                                    ? 'text-blue-600' 
                                                    : index < currentStepIndex 
                                                        ? 'text-green-600' 
                                                        : 'text-gray-400'
                                            }`}>
                                                {step}
                                            </p>
                                            <p className={`text-sm mt-1 ${
                                                index <= currentStepIndex ? 'text-gray-600' : 'text-gray-400'
                                            }`}>
                                                {stepLabels[step]?.desc}
                                            </p>
                                            {index === currentStepIndex && (
                                                <div className="mt-2 flex items-center gap-2">
                                                    <div className="flex gap-1">
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                                    </div>
                                                    <span className="text-sm text-blue-600 font-medium">In Progress</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Order Items */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                        <div className="space-y-2">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTrackingPage;