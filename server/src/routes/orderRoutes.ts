import express from 'express';
import Order from '../models/Order';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Create new order (public - from table)
router.post('/', async (req, res) => {
  try {
    const { tableId, items, totalAmount } = req.body;

    // Validate input
    if (!tableId || !items || items.length === 0 || !totalAmount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const order = new Order({
      tableId,
      items,
      totalAmount,
      status: 'Pending Payment', // Order starts in pending state until payment
      paymentStatus: 'Pending'
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error', error });
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

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get orders by table (for customer view)
router.get('/table/:tableId', async (req, res) => {
  try {
    const orders = await Order.find({ 
      tableId: req.params.tableId 
    }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders by table:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;