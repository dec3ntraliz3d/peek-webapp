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
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      return true;
    } catch (err) {
      setHasPermission(false);
      return false;
    }
  };

  const requestPermission = async () => {
    const granted = await checkCameraPermission();
    if (granted) {
      initializeScanner();
    }
  };

  const initializeScanner = () => {
    const config = {
      fps: 10,
      qrbox: { width: 280, height: 280 },
      aspectRatio: 1.0,
      showTorchButtonIfSupported: true,
      showZoomSliderIfSupported: false,
      defaultZoomValueIfSupported: 1,
      facingMode: "environment", // Always use back camera
      rememberLastUsedCamera: false,
      showCameraSelection: false, // Hide camera selection
    };

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      config,
      true // verbose mode off to reduce UI clutter
    );

    scannerRef.current = scanner;

    const onScanSuccess = (decodedText: string) => {
      setIsScanning(false);
      scanner.clear();
      onScan(decodedText);
    };

    const onScanError = (errorMessage: string) => {
      // Filter out common scanning errors that aren't real issues
      if (errorMessage.includes('NotFoundException') || 
          errorMessage.includes('No MultiFormat Readers') ||
          errorMessage.includes('parse error')) {
        return;
      }
      setError(getFriendlyErrorMessage(errorMessage));
    };

    scanner.render(onScanSuccess, onScanError);
    setIsScanning(true);
  };

  const getFriendlyErrorMessage = (error: string): string => {
    if (error.includes('NotAllowedError') || error.includes('Permission denied')) {
      return 'Camera access denied. Please allow camera permissions and try again.';
    }
    if (error.includes('NotFoundError')) {
      return 'No camera found. Please make sure your device has a camera.';
    }
    if (error.includes('NotReadableError')) {
      return 'Camera is busy or not accessible. Please try again.';
    }
    if (error.includes('OverconstrainedError')) {
      return 'Camera constraints not supported. Please try a different camera.';
    }
    return 'Unable to scan QR code. Make sure the code is clear and well-lit.';
  };

  useEffect(() => {
    checkCameraPermission().then(granted => {
      if (granted) {
        initializeScanner();
      }
    });

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (err) {
          console.error('Error clearing scanner:', err);
        }
      }
    };
  }, []);

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
        {hasPermission === false && (
          <div className="permission-request">
            <div className="permission-icon">📷</div>
            <h3>Camera Access Required</h3>
            <p>To scan QR codes, we need access to your camera.</p>
            <button onClick={requestPermission} className="permission-btn">
              Allow Camera Access
            </button>
          </div>
        )}

        {hasPermission === true && !isScanning && !error && (
          <div className="scanner-loading">
            <div className="loading-spinner"></div>
            <p>Starting camera...</p>
          </div>
        )}

        {hasPermission === true && (
          <>
            <div className="scanner-instructions">
              <p>Point your camera at a QR code</p>
            </div>
            <div id="qr-reader" className="qr-reader"></div>
          </>
        )}
        
        {error && (
          <div className="scanner-error">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
            <button onClick={() => {
              setError('');
              setHasPermission(null);
              checkCameraPermission().then(granted => {
                if (granted) initializeScanner();
              });
            }} className="retry-btn">
              Try Again
            </button>
          </div>
        )}

        {hasPermission === true && isScanning && (
          <div className="scanner-tips">
            <div className="tip">💡 Hold your device steady</div>
            <div className="tip">💡 Ensure good lighting</div>
            <div className="tip">💡 Position QR code within the frame</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;