import express from 'express';
import MenuItem from '../models/MenuItem';
import { authenticate, authorizeAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all menu items (public - for customers)
router.get('/', async (req, res) => {
  try {
    const items = await MenuItem.find({ isAvailable: true }).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get menu items by category (public)
router.get('/category/:category', async (req, res) => {
  try {
    const items = await MenuItem.find({ 
      category: req.params.category, 
      isAvailable: true 
    });
    res.json(items);
  } catch (error) {
    console.error('Error fetching menu items by category:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get all categories (public)
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await MenuItem.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get single menu item (public)
router.get('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Create menu item (admin only)
router.post('/', authenticate, authorizeAdmin, async (req: AuthRequest, res) => {
  try {
    const { name, description, price, category, isVeg, imageUrl } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const menuItem = new MenuItem({
      name,
      description,
      price,
      category,
      isVeg: isVeg !== undefined ? isVeg : true,
      imageUrl
    });

    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Update menu item (admin only)
router.put('/:id', authenticate, authorizeAdmin, async (req: AuthRequest, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Delete menu item (admin only)
router.delete('/:id', authenticate, authorizeAdmin, async (req: AuthRequest, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;