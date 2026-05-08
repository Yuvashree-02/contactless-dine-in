import mongoose from 'mongoose';
import dotenv from 'dotenv';
import QRCode from 'qrcode';
import Table from './models/Table';
import connectDB from './config/database';

const toTableCode = (tableNumber: number) => `T${String(tableNumber).padStart(3, '0')}`;

dotenv.config();

const seedTables = async () => {
  try {
    await connectDB();

    // Clear existing tables
    await Table.deleteMany({});
    console.log('Cleared existing tables');

    // Create 10 sample tables
    const tables = [];
    for (let i = 1; i <= 10; i++) {
      const capacity = i <= 4 ? 2 : i <= 8 ? 4 : 6;
      
      const table = new Table({
        tableNumber: i,
        tableCode: toTableCode(i),
        capacity,
        isAvailable: true,
      });

      const savedTable = await table.save();

      // Generate QR code
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

      tables.push(savedTable);
      console.log(`✓ Created Table ${i} with capacity ${capacity}`);
    }

    console.log(`\n✅ Successfully created ${tables.length} tables with QR codes!`);
    console.log('You can now access the admin panel to view and download the QR codes.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding tables:', error);
    process.exit(1);
  }
};

seedTables();
