import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface QRScannerProps {
  onScanSuccess?: (tableId: string, tableNumber: number) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess }) => {
  const [manualTableId, setManualTableId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handle manual table ID entry (for testing without actual QR scanner)
  const handleManualEntry = () => {
    try {
      if (!manualTableId.trim()) {
        setError('Please enter a table ID');
        return;
      }

      // For now, we'll parse the tableId as a simple string
      // In production, this would come from actual QR code scanning
      const tableData = {
        tableId: manualTableId,
        tableNumber: parseInt(manualTableId) || 0,
        restaurantUrl: `http://localhost:3000/menu?table=${manualTableId}`
      };

      if (onScanSuccess) {
        onScanSuccess(tableData.tableId, tableData.tableNumber);
      } else {
        // Navigate to menu page with table parameter
        navigate(`/menu?table=${tableData.tableId}`);
      }
    } catch (err) {
      setError('Invalid QR code data');
      console.error('QR scan error:', err);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Scan QR Code</h2>
      
      {/* Placeholder for actual QR scanner */}
      <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4 text-center">
        <div className="text-6xl mb-2">📷</div>
        <p className="text-gray-600">QR Scanner Camera View</p>
        <p className="text-sm text-gray-500 mt-2">
          (Actual camera scanning would appear here)
        </p>
      </div>

      {/* Manual Table ID Entry for Testing */}
      <div className="border-t pt-4">
        <p className="text-sm text-gray-600 mb-3 text-center">
          For testing: Enter Table ID manually
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualTableId}
            onChange={(e) => {
              setManualTableId(e.target.value);
              setError('');
            }}
            placeholder="Enter table ID (e.g., 673fcd7a...)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={handleManualEntry}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Go
          </button>
        </div>
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> To implement real QR scanning, install a package like{' '}
          <code className="bg-blue-100 px-1 rounded">react-qr-reader</code> or{' '}
          <code className="bg-blue-100 px-1 rounded">html5-qrcode</code>
        </p>
      </div>
    </div>
  );
};

export default QRScanner;