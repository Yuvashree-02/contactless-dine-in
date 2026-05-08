import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';
import Table from '../models/Table';
import { authenticate, AuthRequest } from '../middleware/auth';
import { emitOrderUpdated, subscribeToOrderUpdates } from '../utils/orderEvents';
import { syncOrderToGoogleSheet } from '../utils/googleSheetsSync';
import { 
  getAllOrders, 
  getDailySalesAnalytics, 
  getOrderStatusSummary, 
  getTopMenuItems,
  submitFeedback
} from '../controllers/orderController';

const router = express.Router();

const normalizeTableRefToCode = async (tableRef: string): Promise<string> => {
  const trimmedRef = String(tableRef).trim();
  const numericRef = Number(trimmedRef);

  let table = null;

  if (!Number.isNaN(numericRef)) {
    table = await Table.findOne({ tableNumber: numericRef });
  }

  if (!table) {
    table = await Table.findOne({ tableCode: trimmedRef });
  }

  if (!table && mongoose.Types.ObjectId.isValid(trimmedRef)) {
    table = await Table.findById(trimmedRef);
  }

  return table?.tableCode || trimmedRef;
};

// Create new order (public - from table)
router.post('/', async (req, res) => {
  try {
    const { tableId, customerName, customerPhone, items, totalAmount } = req.body;

    // Validate input
    if (!tableId || !customerName || !customerPhone || !items || items.length === 0 || !totalAmount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const normalizedTableId = await normalizeTableRefToCode(tableId);

    const order = new Order({
      tableId: normalizedTableId,
      customerName,
      customerPhone,
      items,
      totalAmount,
      status: 'Pending Payment', // Order starts in pending state until payment
      paymentStatus: 'Pending'
    });

    await order.save();
    emitOrderUpdated(order);
    void syncOrderToGoogleSheet(order);
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Backfill all existing orders to Google Sheets (staff/admin only)
router.post('/sync/google-sheets', authenticate, async (req: AuthRequest, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: 1 });
    await Promise.all(orders.map((order) => syncOrderToGoogleSheet(order)));

    res.json({
      success: true,
      syncedCount: orders.length,
      message: 'Orders synced to Google Sheets',
    });
  } catch (error) {
    console.error('Error syncing orders to Google Sheets:', error);
    res.status(500).json({ message: 'Failed to sync orders to Google Sheets', error });
  }
});

// Get order by ID (public - for order tracking)
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get all orders with optional status filter (staff/admin only)
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { status, tableId } = req.query;
    const filter: any = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (tableId) {
      filter.tableId = tableId;
    }
    
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Update order status (staff/admin only)
router.patch('/:id/status', authenticate, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['Received', 'In Kitchen', 'Ready', 'Served'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    emitOrderUpdated(order);
    void syncOrderToGoogleSheet(order);
    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Live stream order updates for customer tracking page
router.get('/stream/:id', async (req, res) => {
  const { id } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const writeEvent = (event: string, payload: unknown) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  // Initial payload for immediate UI hydration.
  const initialOrder = await Order.findById(id);
  if (initialOrder) {
    writeEvent('order-update', initialOrder);
  }

  const unsubscribe = subscribeToOrderUpdates(id, (order) => {
    writeEvent('order-update', order);
  });

  // Keep-alive ping so proxies do not close idle SSE connections.
  const keepAlive = setInterval(() => {
    res.write(': ping\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(keepAlive);
    unsubscribe();
    res.end();
  });
});

// Get orders by table (for customer view)
router.get('/table/:tableId', async (req, res) => {
  try {
    const normalizedTableId = await normalizeTableRefToCode(req.params.tableId);
    const orders = await Order.find({ 
      tableId: normalizedTableId 
    }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders by table:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Submit feedback for an order (public)
router.post('/:id/feedback', async (req, res) => {
  return submitFeedback(req, res);
});

// Admin Analytics Endpoints
// Get all orders for admin dashboard
router.get('/admin/all-orders', authenticate, getAllOrders);

// Get daily sales analytics
router.get('/admin/sales-analytics', authenticate, getDailySalesAnalytics);

// Get order status summary
router.get('/admin/status-summary', authenticate, getOrderStatusSummary);

// Get top menu items
router.get('/admin/top-items', authenticate, getTopMenuItems);

export default router;