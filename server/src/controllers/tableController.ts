import { Request, Response } from 'express';
import mongoose from 'mongoose';
import QRCode from 'qrcode';
import Table from '../models/Table';

const toTableCode = (tableNumber: number) => `T${String(tableNumber).padStart(3, '0')}`;

const ensureTableCode = async (table: any) => {
    if (table && !table.tableCode) {
        table.tableCode = toTableCode(table.tableNumber);
        await table.save();
    }
    return table;
};

// Fetch all tables
export const getTables = async (req: Request, res: Response) => {
    try {
        const tables = await Table.find().sort({ tableNumber: 1 });
        await Promise.all(tables.map((table) => ensureTableCode(table)));
        res.status(200).json(tables);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tables', error });
    }
};

// Fetch a table by ID
export const getTableById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        let table = await Table.findOne({ tableCode: id });

        if (!table && mongoose.Types.ObjectId.isValid(id)) {
            table = await Table.findById(id);
        }

        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        await ensureTableCode(table);
        res.status(200).json(table);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching table', error });
    }
};

// Fetch a table by table number
export const getTableByNumber = async (req: Request, res: Response) => {
    const { tableNumber } = req.params;
    try {
        const parsedTableNumber = Number(tableNumber);
        if (Number.isNaN(parsedTableNumber)) {
            return res.status(400).json({ message: 'Invalid table number' });
        }

        const table = await Table.findOne({ tableNumber: parsedTableNumber });
        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        await ensureTableCode(table);

        res.status(200).json(table);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching table', error });
    }
};

// Create a new table and generate QR code
export const createTable = async (req: Request, res: Response) => {
    try {
        const tableNumber = Number(req.body.tableNumber);
        const newTable = new Table({
            ...req.body,
            tableCode: toTableCode(tableNumber),
        });
        const savedTable = await newTable.save();

        // Generate QR code for the new table
        const qrData = JSON.stringify({
            tableId: savedTable.tableCode,
            tableNumber: savedTable.tableNumber,
            tableCode: savedTable.tableCode,
            restaurantUrl: `http://localhost:3000/table/${savedTable.tableCode}`
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
        const table = await Table.findById(id);
        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        if (req.body.tableNumber !== undefined) {
            table.tableNumber = Number(req.body.tableNumber);
            table.tableCode = toTableCode(table.tableNumber);
        }

        if (req.body.capacity !== undefined) {
            table.capacity = Number(req.body.capacity);
        }

        if (req.body.isAvailable !== undefined) {
            table.isAvailable = Boolean(req.body.isAvailable);
        }

        const updatedTable = await table.save();
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