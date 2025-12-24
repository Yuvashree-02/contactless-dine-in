import { Request, Response } from 'express';
import Menu from '../models/Menu';

// Fetch all menu items
export const getMenuItems = async (req: Request, res: Response) => {
    try {
        const menuItems = await Menu.find();
        res.status(200).json(menuItems);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching menu items', error });
    }
};

// Fetch a single menu item by ID
export const getMenuItemById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const menuItem = await Menu.findById(id);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.status(200).json(menuItem);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching menu item', error });
    }
};

// Create a new menu item
export const createMenuItem = async (req: Request, res: Response) => {
    const newMenuItem = new Menu(req.body);
    try {
        const savedMenuItem = await newMenuItem.save();
        res.status(201).json(savedMenuItem);
    } catch (error) {
        res.status(500).json({ message: 'Error creating menu item', error });
    }
};

// Update an existing menu item
export const updateMenuItem = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const updatedMenuItem = await Menu.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedMenuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.status(200).json(updatedMenuItem);
    } catch (error) {
        res.status(500).json({ message: 'Error updating menu item', error });
    }
};

// Delete a menu item
export const deleteMenuItem = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const deletedMenuItem = await Menu.findByIdAndDelete(id);
        if (!deletedMenuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.status(200).json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting menu item', error });
    }
};