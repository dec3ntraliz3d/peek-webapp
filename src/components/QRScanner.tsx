import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (data: string) => void;
  onBack: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onBack }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const config = {
      fps: 10,
      qrbox: { width: 280, height: 280 },
      aspectRatio: 1.0,
      facingMode: "environment",
      showTorchButtonIfSupported: true,
      showZoomSliderIfSupported: false,
      rememberLastUsedCamera: false,
    };

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      config,
      false
    );

    scannerRef.current = scanner;

    const onScanSuccess = (decodedText: string) => {
      // Stop scanner immediately
      scanner.clear();
      
      // Stop any video streams
      const videoElement = document.querySelector('#qr-reader video') as HTMLVideoElement;
      if (videoElement?.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      
      onScan(decodedText);
    };

    const onScanError = (errorMessage: string) => {
      // Only show real errors, not scanning attempts
      if (errorMessage.includes('NotFoundException') || 
          errorMessage.includes('No MultiFormat Readers') ||
          errorMessage.includes('parse error')) {
        return;
      }
      
      if (errorMessage.includes('NotAllowedError') || errorMessage.includes('Permission denied')) {
        setError('Camera access denied. Please allow camera permissions in your browser settings.');
      } else if (errorMessage.includes('NotFoundError')) {
        setError('No camera found on this device.');
      } else {
        setError('Camera error. Please try again.');
      }
    };

    scanner.render(onScanSuccess, onScanError);

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (err) {
          console.error('Error clearing scanner:', err);
        }
      }
      
      // Clean up video streams
      const videoElement = document.querySelector('#qr-reader video') as HTMLVideoElement;
      if (videoElement?.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
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
    
    // Clean up video streams
    const videoElement = document.querySelector('#qr-reader video') as HTMLVideoElement;
    if (videoElement?.srcObject) {
      const stream = videoElement.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
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
        
        <div id="qr-reader" className="qr-reader"></div>
        
        {error && (
          <div className="scanner-error">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
            <button onClick={() => setError('')} className="retry-btn">
              Try Again
            </button>
          </div>
        )}
        
        <div className="scanner-tips">
          <div className="tip">💡 Hold your device steady</div>
          <div className="tip">💡 Ensure good lighting</div>
          <div className="tip">💡 Position QR code within the frame</div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;