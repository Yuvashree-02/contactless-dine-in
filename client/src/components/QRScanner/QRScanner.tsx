import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { tableAPI } from '../../services/api';

interface QRScannerProps {
  onScanSuccess?: (tableId: string, tableNumber: number) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess }) => {
  const [manualTableId, setManualTableId] = useState('');
  const [error, setError] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const cameraRegionId = 'qr-reader';

  const parseAndNavigate = (decodedText: string) => {
    try {
      let tableId = decodedText;
      let tableNumber = 0;

      const parseFromUrl = (value: string) => {
        try {
          const url = new URL(value);
          const tableFromPath = url.pathname.match(/\/table\/(.+)$/);
          const tableFromQuery = url.searchParams.get('table');
          return tableFromPath?.[1] || tableFromQuery || value;
        } catch {
          return value;
        }
      };

      if (decodedText.trim().startsWith('{')) {
        const parsed = JSON.parse(decodedText);
        tableId = parsed.tableCode || parsed.tableId || parseFromUrl(parsed.restaurantUrl || decodedText);
        tableNumber = Number(parsed.tableNumber) || 0;
      } else {
        tableId = parseFromUrl(decodedText);
      }

      if (onScanSuccess) {
        onScanSuccess(tableId, tableNumber);
      } else {
        navigate(`/table/${tableId}`);
      }
    } catch (err) {
      setError('Invalid QR code data');
      console.error('QR scan error:', err);
    }
  };

  const choosePreferredCameraId = (cameras: Array<{ id: string; label: string }>) => {
    // On laptops there is usually only one front webcam, so prefer the first available camera.
    return cameras[0]?.id || '';
  };

  const loadCameras = async () => {
    try {
      const cameras = await Html5Qrcode.getCameras();
      const mapped = cameras.map((camera) => ({ id: camera.id, label: camera.label || `Camera ${camera.id}` }));
      setAvailableCameras(mapped);

      if (!selectedCameraId && mapped.length > 0) {
        setSelectedCameraId(choosePreferredCameraId(mapped));
      }
    } catch {
      // Ignore camera list errors until user actively starts scanning.
    }
  };

  const stopCamera = async () => {
    const scanner = scannerRef.current;

    if (!scanner) {
      setIsCameraActive(false);
      return;
    }

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
      scanner.clear();
    } catch (stopError) {
      console.error('Failed to stop QR scanner:', stopError);
    }

    scannerRef.current = null;
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setError('');
    setIsLoadingCamera(true);

    try {
      if (scannerRef.current) {
        await stopCamera();
      }

      const scanner = new Html5Qrcode(cameraRegionId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        useBarCodeDetectorIfSupported: true,
        verbose: false,
      });
      scannerRef.current = scanner;

      const cameras = await Html5Qrcode.getCameras();
      const mapped = cameras.map((camera) => ({ id: camera.id, label: camera.label || `Camera ${camera.id}` }));
      setAvailableCameras(mapped);
      const preferredCameraId = selectedCameraId || choosePreferredCameraId(mapped);
      if (preferredCameraId && preferredCameraId !== selectedCameraId) {
        setSelectedCameraId(preferredCameraId);
      }

      await scanner.start(
        preferredCameraId || { facingMode: 'environment' },
        {
          fps: 8,
          disableFlip: false,
        },
        (decodedText) => {
          stopCamera().catch(() => undefined);
          parseAndNavigate(decodedText);
        },
        () => undefined
      );

      setIsCameraActive(true);
    } catch (cameraError) {
      console.error('Camera scanner failed to start:', cameraError);
      setError('Camera access failed. Please allow camera permission or use an image upload.');
      scannerRef.current = null;
      setIsCameraActive(false);
    } finally {
      setIsLoadingCamera(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) {
      return;
    }

    setError('');

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(cameraRegionId);
      }

      if (isCameraActive) {
        await stopCamera();
        scannerRef.current = new Html5Qrcode(cameraRegionId);
      }

      const decodedText = await scannerRef.current.scanFile(file, true);
      parseAndNavigate(decodedText);
    } catch (imageError) {
      console.error('Image QR scan failed:', imageError);
      setError('Could not read QR code from that image. Please try another image or use the camera.');
    }
  };

  const resolveTableId = async (inputValue: string) => {
    const normalizedInput = inputValue.trim();
    const numericTable = Number(normalizedInput);

    if (!Number.isNaN(numericTable)) {
      const table = await tableAPI.getByNumber(numericTable);
      return {
        tableId: table.tableCode || table._id,
        tableNumber: table.tableNumber,
      };
    }

    const table = await tableAPI.getById(normalizedInput);
    return {
      tableId: table.tableCode || table._id,
      tableNumber: table.tableNumber || 0,
    };
  };

  // Handle manual simple table entry (table number or table ID)
  const handleManualEntry = async () => {
    try {
      if (!manualTableId.trim()) {
        setError('Please enter a table number or table code');
        return;
      }

      const tableData = await resolveTableId(manualTableId);

      if (onScanSuccess) {
        onScanSuccess(tableData.tableId, tableData.tableNumber);
      } else {
        // Navigate to the customer menu page for the scanned table
        navigate(`/table/${tableData.tableId}`);
      }
    } catch (err) {
      setError('Invalid QR code data');
      console.error('QR scan error:', err);
    }
  };

  useEffect(() => {
    loadCameras().catch(() => undefined);

    return () => {
      stopCamera().catch(() => undefined);
    };
    // The scanner setup should run once when the component mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Scan QR Code</h2>
      
      <div className="relative bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4 text-center min-h-[320px] overflow-hidden">
        <div id={cameraRegionId} className="mx-auto w-full" />
        {!isCameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 px-4">
            <div className="text-6xl mb-2">📷</div>
            <p className="text-gray-600">
              {isLoadingCamera ? 'Requesting camera access...' : 'Use camera or upload a QR image'}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {availableCameras.length > 0 && (
          <select
            value={selectedCameraId}
            onChange={(event) => setSelectedCameraId(event.target.value)}
            className="sm:col-span-2 border border-gray-300 rounded-lg px-3 py-2"
          >
            {availableCameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.label}
              </option>
            ))}
          </select>
        )}

        <button
          type="button"
          onClick={() => {
            startCamera().catch(() => undefined);
          }}
          disabled={isLoadingCamera}
          className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
        >
          {isLoadingCamera ? 'Starting Camera...' : isCameraActive ? 'Restart Camera' : 'Use Camera'}
        </button>

        <button
          type="button"
          onClick={() => {
            stopCamera().catch(() => undefined);
          }}
          disabled={!isCameraActive && !isLoadingCamera}
          className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 disabled:bg-gray-300 transition-colors"
        >
          Stop Camera
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-gray-800 text-white px-4 py-3 rounded-lg hover:bg-gray-900 transition-colors text-center"
        >
          Scan Image File
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              handleImageUpload(file);
              event.target.value = '';
            }
          }}
        />
      </div>

      {/* Manual Table ID Entry for Testing */}
      <div className="border-t pt-4">
        <p className="text-sm text-gray-600 mb-3 text-center">
          For testing: Enter table number or table code
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualTableId}
            onChange={(e) => {
              setManualTableId(e.target.value);
              setError('');
            }}
            placeholder="Enter table number (e.g., 1) or code (e.g., T001)"
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
          💡 <strong>Tip:</strong> On laptops, use the built-in webcam and hold the QR code steady in bright light.
        </p>
      </div>
    </div>
  );
};

export default QRScanner;