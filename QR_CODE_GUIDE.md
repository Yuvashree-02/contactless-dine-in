# QR Code System - User Guide

## Overview
The contactless dine-in system now supports unique QR codes for each table. Restaurants can generate, print, and manage QR codes that customers scan to access the menu for their specific table.

## Features Implemented

### 1. **Unique QR Code Generation**
- Each table has a unique QR code that contains:
  - Table ID (MongoDB ObjectId)
  - Table Number (human-readable)
  - Direct URL to the menu page with table parameter

### 2. **Admin Table Management**
- Access via: **Admin Dashboard → "Manage Tables" button**
- URL: `http://localhost:3000/admin/tables`

#### Features:
- ✅ Create new tables with number and capacity
- ✅ View all tables with their QR codes
- ✅ Download QR codes as PNG images
- ✅ Print QR codes with table information
- ✅ Mark tables as Available/Occupied
- ✅ Delete tables
- ✅ Regenerate all QR codes at once

### 3. **Customer QR Scanning Flow**
1. Customer scans QR code on table
2. System extracts table information
3. Redirects to menu page with table ID
4. Customer browses menu and adds items to cart
5. Places order (linked to specific table)

### 4. **QR Code Storage**
- QR codes are stored as Base64-encoded data URLs in MongoDB
- Automatically generated when creating new tables
- Can be regenerated for all tables with one click

## How to Use

### For Restaurant Admins:

#### Creating Tables
1. Login to admin panel: `http://localhost:3000/admin/login`
2. Navigate to "Manage Tables"
3. Click "+ Add New Table"
4. Enter:
   - **Table Number**: e.g., 1, 2, 3... (must be unique)
   - **Capacity**: Number of people (e.g., 2, 4, 6)
5. Click "Create Table"
6. QR code is automatically generated!

#### Downloading QR Codes
1. Go to "Manage Tables" page
2. Find the desired table
3. Click "📥 Download QR" button
4. Image saves as: `table-[number]-qr.png`
5. Print and place on physical table

#### Printing QR Codes
1. Click "🖨️ Print QR" button on any table card
2. Print dialog opens with formatted QR code
3. Includes:
   - Table number
   - QR code (300x300px)
   - Capacity information
   - Instructions for customers

#### Managing Tables
- **Mark as Occupied**: Click the status toggle button
- **Mark as Available**: Click the status toggle again
- **Delete Table**: Click "🗑️ Delete Table" (with confirmation)
- **Regenerate All QR Codes**: Click "🔄 Regenerate All QR Codes" in header

### For Customers:

#### Using QR Codes
1. Scan QR code on your table with phone camera
2. Browser opens menu page automatically
3. Table ID is saved in your session
4. Browse menu and add items
5. Proceed to checkout
6. Order is linked to your table number

#### Manual Table Entry (For Testing)
1. Go to homepage: `http://localhost:3000`
2. Click "🔷 Scan QR Code"
3. Enter table ID manually
4. Click "Go"

## Technical Details

### Backend APIs

#### Table Routes (`/api/tables`)
- `GET /api/tables` - Get all tables
- `GET /api/tables/:id` - Get table by ID
- `POST /api/tables` - Create new table (auto-generates QR)
- `PUT /api/tables/:id` - Update table
- `DELETE /api/tables/:id` - Delete table

#### QR Routes (`/api/qr`)
- `POST /api/qr/generate/:tableId` - Generate QR for specific table
- `POST /api/qr/regenerate-all` - Regenerate all QR codes
- `POST /api/qr/scan` - Validate scanned QR code

### QR Code Data Structure
```json
{
  "tableId": "673fcd7a1234567890abcdef",
  "tableNumber": 5,
  "restaurantUrl": "http://localhost:3000/menu?table=673fcd7a1234567890abcdef"
}
```

### Database Schema Updates

#### Table Model
```typescript
{
  tableNumber: Number (required, unique)
  capacity: Number (required)
  isAvailable: Boolean (default: true)
  qrCode: String (Base64 data URL)
  createdAt: Date
  updatedAt: Date
}
```

### Frontend Components

- **AdminTableManagementPage**: Full table CRUD interface
- **QRScanner**: QR code scanning component (with manual entry fallback)
- **HomePage**: Integrated QR scanner access
- **MenuPage**: Accepts table ID from URL parameter or query string
- **CheckoutPage**: Uses table ID from cart context

### URL Patterns

- `/menu?table=[tableId]` - Menu page with table parameter
- `/admin/tables` - Table management page
- `/table/:tableId` - Legacy table route (still supported)

## Seed Data

Run this command to create 10 sample tables with QR codes:

```bash
cd server
npx ts-node src/seedTables.ts
```

Creates:
- Tables 1-4: Capacity 2
- Tables 5-8: Capacity 4
- Tables 9-10: Capacity 6

All with unique QR codes ready to use!

## Testing the System

### Quick Test:
1. Run backend: `cd server && npm start`
2. Run frontend: `cd client && npm start`
3. Seed tables: `cd server && npx ts-node src/seedTables.ts`
4. Login as admin: `http://localhost:3000/admin/login`
5. Go to "Manage Tables"
6. Download a QR code
7. Scan with phone or enter table ID manually
8. Verify menu opens with correct table

### Production Notes:
- Replace `http://localhost:3000` with your production domain
- QR codes will need to be regenerated for production URLs
- Use the "Regenerate All QR Codes" button after deployment
- Consider using a package like `react-qr-reader` for real camera scanning

## Future Enhancements

Potential additions:
- Real-time QR code scanning with camera
- Batch QR code download (ZIP file)
- Custom QR code styling/branding
- QR code expiry/rotation for security
- Analytics: track which tables scan most
- Multi-location support with location codes

## Troubleshooting

**QR codes not showing:**
- Check MongoDB connection
- Verify qrcode package is installed
- Check browser console for errors

**Scan not working:**
- For testing, use manual table ID entry
- Install react-qr-reader for real scanning
- Check phone camera permissions

**Table not linking to orders:**
- Verify table ID is in URL parameter
- Check CartContext has tableId
- Inspect localStorage for tableId value

## Summary

✅ **Completed:**
- Unique QR generation for each table
- Admin interface to manage tables
- Download and print functionality
- Table-to-order linking
- Seed script for sample data

📱 **Ready for:**
- Restaurant deployment
- Physical QR code printing
- Customer testing
- Production use (after URL updates)

🎯 **Benefits:**
- Contactless ordering
- Accurate table tracking
- Professional presentation
- Easy table management
- Scalable system
