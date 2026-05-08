import express from 'express';
import Order from '../models/Order';
import { emitOrderUpdated } from '../utils/orderEvents';
import { syncOrderToGoogleSheet } from '../utils/googleSheetsSync';
import { sendReceipt } from '../utils/notifications';

const router = express.Router();

// Create payment intent (for demo purposes - would integrate with Razorpay/Stripe in production)
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    // In production, this would create a Razorpay/Stripe payment intent
    // For now, we'll simulate a payment ID
    const paymentId = `pay_${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

    res.json({
      success: true,
      paymentId,
      amount,
      orderId,
      message: 'Payment intent created successfully'
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Failed to create payment intent' });
  }
});

// Verify payment
router.post('/verify-payment', async (req, res) => {
  try {
    const { orderId, paymentId, paymentMethod } = req.body;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // In production, verify payment with Razorpay/Stripe
    // For demo, we'll simulate successful payment
    order.paymentStatus = 'Paid';
    order.paymentMethod = paymentMethod;
    order.paymentId = paymentId;
    order.paidAt = new Date();
    
    // Change order status to "Received" so it goes to kitchen
    order.status = 'Received';
    
    await order.save();
    emitOrderUpdated(order);
    void syncOrderToGoogleSheet(order);

    // Send receipt & feedback link to customer (SMS / Email) if available
    try {
      await sendReceipt(order, { toPhone: order.customerPhone, toEmail: undefined });
    } catch (err) {
      console.error('Error sending receipt:', err);
    }

    res.json({
      success: true,
      message: 'Payment verified successfully. Order sent to kitchen!',
      order
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
});

// Get payment status
router.get('/:orderId/status', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      paymentStatus: order.paymentStatus || 'Pending',
      paymentMethod: order.paymentMethod,
      paymentId: order.paymentId,
      paidAt: order.paidAt
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ message: 'Failed to fetch payment status' });
  }
});

export default router;
