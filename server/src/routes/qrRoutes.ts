import { Router } from 'express';
import { generateQRCode, scanQRCode, regenerateAllQRCodes } from '../controllers/qrController';

const router = Router();

// Generate QR code for a specific table
router.post('/generate/:tableId', generateQRCode);

// Regenerate all QR codes
router.post('/regenerate-all', regenerateAllQRCodes);

// Scan QR code to get table info
router.post('/scan', scanQRCode);

export default router;