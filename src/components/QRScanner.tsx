import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (data: string) => void;
  onBack: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onBack }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      config,
      false
    );

    scannerRef.current = scanner;

    const onScanSuccess = (decodedText: string) => {
      setIsScanning(false);
      scanner.clear();
      onScan(decodedText);
    };

    const onScanError = (errorMessage: string) => {
      // Don't show continuous scan errors, only real issues
      if (errorMessage.includes('NotFoundException')) return;
      setError(errorMessage);
    };

    scanner.render(onScanSuccess, onScanError);
    setIsScanning(true);

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (err) {
          console.error('Error clearing scanner:', err);
        }
      }
    };
  }, [onScan]);

  const handleBack = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error clearing scanner:', err);
      }
    }
    onBack();
  };

  return (
    <div className="scanner-container">
      <div className="scanner-header">
        <button onClick={handleBack} className="back-btn">
          ← Back
        </button>
        <h2>Scan QR Code</h2>
      </div>

      <div className="scanner-content">
        <p>Point your camera at a QR code to scan</p>
        
        <div id="qr-reader" className="qr-reader"></div>
        
        {error && (
          <div className="error">
            Camera error: {error}
          </div>
        )}

        {!isScanning && !error && (
          <div className="scanner-info">
            <p>📱 Make sure to allow camera access when prompted</p>
            <p>📷 Hold steady and ensure good lighting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;