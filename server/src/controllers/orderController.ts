import { Request, Response } from 'express';
import Order from '../models/Order';

const getErrorMessage = (error: unknown): string =>
    error instanceof Error ? error.message : 'An unexpected error occurred';

// Create a new order
export const createOrder = async (req: Request, res: Response) => {
    try {
        const order = new Order(req.body);
        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ message: getErrorMessage(error) });
    }
};

// Get an order by ID
export const getOrderById = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
};

// Update an order by ID
export const updateOrder = async (req: Request, res: Response) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(400).json({ message: getErrorMessage(error) });
    }
};

// Delete an order by ID
export const deleteOrder = async (req: Request, res: Response) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
};

// Get all orders (for admin)
export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
};

// Get daily sales analytics
export const getDailySalesAnalytics = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;
        
        let query: any = {};
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate as string);
            if (endDate) {
                const end = new Date(endDate as string);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        const orders = await Order.find(query);

        // Group by date and calculate totals
        const dailySales: { [key: string]: { date: string; totalRevenue: number; orderCount: number; paidOrders: number } } = {};

        orders.forEach((order) => {
            const dateStr = order.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
            if (!dailySales[dateStr]) {
                dailySales[dateStr] = { date: dateStr, totalRevenue: 0, orderCount: 0, paidOrders: 0 };
            }
            dailySales[dateStr].totalRevenue += order.totalAmount;
            dailySales[dateStr].orderCount += 1;
            if (order.paymentStatus === 'Paid') {
                dailySales[dateStr].paidOrders += 1;
            }
        });

        const result = Object.values(dailySales).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
};

// Get order status summary
export const getOrderStatusSummary = async (req: Request, res: Response) => {
    try {
        const summary = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' }
                }
            }
        ]);
        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
};

// Submit feedback for an order (public)
export const submitFeedback = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { rating, comments } = req.body;

        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.feedback = {
            rating: Number(rating) || undefined,
            comments: comments || undefined,
            submittedAt: new Date()
        } as any;

        await order.save();

        res.json({ success: true, message: 'Feedback received. Thank you!' });
    } catch (error) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
};

// Get top menu items
export const getTopMenuItems = async (req: Request, res: Response) => {
    try {
        const topItems = await Order.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.name',
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 }
        ]);
        res.json(topItems);
    } catch (error) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
};