import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';

interface QRScannerProps {
  onScan: (data: string) => void;
  onBack: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [error, setError] = useState('');
  const [hasCamera, setHasCamera] = useState(true);

  useEffect(() => {
    const initScanner = async () => {
      if (!videoRef.current) return;

      try {
        // Check if camera is available
        const hasCamera = await QrScanner.hasCamera();
        if (!hasCamera) {
          setError('No camera found on this device.');
          setHasCamera(false);
          return;
        }

        // Create scanner
        const scanner = new QrScanner(
          videoRef.current,
          (result: QrScanner.ScanResult) => {
            console.log('QR detected:', result.data);
            scanner.stop();
            onScan(result.data);
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: 'environment'
          }
        );

        scannerRef.current = scanner;
        
        // Start scanning
        await scanner.start();
        console.log('Scanner started');

      } catch (err: any) {
        console.error('Scanner error:', err);
        
        if (err.name === 'NotAllowedError') {
          setError('Camera permission denied. Please allow camera access and refresh the page.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found.');
        } else if (err.name === 'NotReadableError') {
          setError('Camera is busy. Close other camera apps and try again.');
        } else {
          setError('Failed to access camera. Please try again.');
        }
      }
    };

    initScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
      }
    };
  }, [onScan]);

  const handleBack = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
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
        <div className="scanner-instructions">
          <p>Point your camera at a QR code</p>
        </div>
        
        <div className="camera-container">
          <video 
            ref={videoRef} 
            className="qr-video"
            style={{
              width: '100%',
              maxWidth: '400px',
              height: 'auto',
              borderRadius: '8px',
              backgroundColor: '#000'
            }}
          />
        </div>
        
        {error && (
          <div className="scanner-error">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
            {!hasCamera && (
              <p style={{ fontSize: '0.9rem', marginTop: '8px', opacity: 0.8 }}>
                This feature requires a camera-enabled device.
              </p>
            )}
            <button onClick={() => {
              setError('');
              window.location.reload();
            }} className="retry-btn">
              Try Again
            </button>
          </div>
        )}
        
        <div className="scanner-tips">
          <div className="tip">💡 Hold device steady</div>
          <div className="tip">💡 Ensure good lighting</div>
          <div className="tip">💡 Position QR code in frame</div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;