import { Request, Response } from 'express';
import QRCode from 'qrcode';
import Table from '../models/Table';

// Fetch all tables
export const getTables = async (req: Request, res: Response) => {
    try {
        const tables = await Table.find();
        res.status(200).json(tables);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tables', error });
    }
};

// Fetch a table by ID
export const getTableById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const table = await Table.findById(id);
        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }
        res.status(200).json(table);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching table', error });
    }
};

// Create a new table and generate QR code
export const createTable = async (req: Request, res: Response) => {
    try {
        const newTable = new Table(req.body);
        const savedTable = await newTable.save();

        // Generate QR code for the new table
        const qrData = JSON.stringify({
            tableId: savedTable._id,
            tableNumber: savedTable.tableNumber,
            restaurantUrl: `http://localhost:3000/menu?table=${savedTable._id}`
        });
        
        const qrCode = await QRCode.toDataURL(qrData, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 2
        });

        savedTable.qrCode = qrCode;
        await savedTable.save();

        res.status(201).json(savedTable);
    } catch (error) {
        res.status(500).json({ message: 'Error creating table', error });
    }
};

// Update a table by ID
export const updateTable = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const updatedTable = await Table.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedTable) {
            return res.status(404).json({ message: 'Table not found' });
        }
        res.status(200).json(updatedTable);
    } catch (error) {
        res.status(500).json({ message: 'Error updating table', error });
    }
};

// Delete a table by ID
export const deleteTable = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const deletedTable = await Table.findByIdAndDelete(id);
        if (!deletedTable) {
            return res.status(404).json({ message: 'Table not found' });
        }
        res.status(200).json({ message: 'Table deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting table', error });
    }
};