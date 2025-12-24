import { Request, Response } from 'express';
import QRCode from 'qrcode';
import Table from '../models/Table';

// Generate a QR code for a specific table
export const generateQRCode = async (req: Request, res: Response) => {
    const { tableId } = req.params;

    try {
        const table = await Table.findById(tableId);
        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        // Generate QR code with table information
        const qrData = JSON.stringify({
            tableId: table._id,
            tableNumber: table.tableNumber,
            restaurantUrl: `http://localhost:3000/menu?table=${table._id}`
        });
        
        const qrCode = await QRCode.toDataURL(qrData, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 2
        });

        // Save QR code to table document
        table.qrCode = qrCode;
        await table.save();

        res.status(200).json({ qrCode, table });
    } catch (error) {
        res.status(500).json({ message: 'Error generating QR code', error });
    }
};

// Regenerate QR codes for all tables
export const regenerateAllQRCodes = async (req: Request, res: Response) => {
    try {
        const tables = await Table.find();
        
        const updatedTables = await Promise.all(
            tables.map(async (table) => {
                const qrData = JSON.stringify({
                    tableId: table._id,
                    tableNumber: table.tableNumber,
                    restaurantUrl: `http://localhost:3000/menu?table=${table._id}`
                });
                
                const qrCode = await QRCode.toDataURL(qrData, {
                    errorCorrectionLevel: 'H',
                    type: 'image/png',
                    width: 300,
                    margin: 2
                });

                table.qrCode = qrCode;
                await table.save();
                return table;
            })
        );

        res.status(200).json({ 
            message: 'QR codes regenerated successfully', 
            count: updatedTables.length,
            tables: updatedTables 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error regenerating QR codes', error });
    }
};

// Scan a QR code and retrieve the table information
export const scanQRCode = async (req: Request, res: Response) => {
    const { tableId } = req.body;

    try {
        const table = await Table.findById(tableId);
        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        res.status(200).json({ table });
    } catch (error) {
        res.status(500).json({ message: 'Error scanning QR code', error });
    }
};