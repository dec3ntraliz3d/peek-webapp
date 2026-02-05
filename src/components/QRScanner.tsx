import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState('');

  // Haptic feedback function
  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
  }, []);

  const handleScanSuccess = useCallback((data: string) => {
    triggerHaptic();
    if (scannerRef.current) {
      scannerRef.current.stop();
    }
    onScan(data);
  }, [onScan, triggerHaptic]);

  const initScanner = useCallback(async () => {
    if (!videoRef.current) return;

    setIsLoading(true);
    setError('');

    try {
      const cameraAvailable = await QrScanner.hasCamera();
      if (!cameraAvailable) {
        setError('No camera found on this device.');
        setHasCamera(false);
        setIsLoading(false);
        return;
      }

      // Destroy existing scanner if any
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
      }

      const scanner = new QrScanner(
        videoRef.current,
        (result: QrScanner.ScanResult) => {
          handleScanSuccess(result.data);
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment'
        }
      );

      scannerRef.current = scanner;
      await scanner.start();

      // Check if torch is available
      const torchAvailable = await scanner.hasFlash();
      setHasTorch(torchAvailable);
      setIsLoading(false);

    } catch (err: unknown) {
      const error = err as { name?: string; message?: string };
      setIsLoading(false);

      if (error.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (error.name === 'NotFoundError') {
        setError('No camera found.');
        setHasCamera(false);
      } else if (error.name === 'NotReadableError') {
        setError('Camera is busy. Close other camera apps and try again.');
      } else {
        setError('Failed to access camera. Please try again.');
      }
    }
  }, [handleScanSuccess]);

  useEffect(() => {
    initScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
      }
    };
  }, [initScanner]);

  const handleBack = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
    }
    onBack();
  };

  const handleRetry = () => {
    setError('');
    initScanner();
  };

  const toggleTorch = async () => {
    if (scannerRef.current && hasTorch) {
      try {
        if (torchOn) {
          await scannerRef.current.turnFlashOff();
        } else {
          await scannerRef.current.turnFlashOn();
        }
        setTorchOn(!torchOn);
      } catch (err) {
        console.error('Failed to toggle torch:', err);
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleScanSuccess(manualCode.trim());
    }
  };

  return (
    <div className="scanner-container">
      <div className="scanner-header">
        <button onClick={handleBack} className="back-btn">
          ← Back
        </button>
        <h2>Scan QR Code</h2>
        <div style={{ width: '60px' }} /> {/* Spacer for centering */}
      </div>

      <div className="scanner-content">
        {isLoading && !error && (
          <div className="scanner-loading">
            <div className="loading-spinner"></div>
            <p>Starting camera...</p>
          </div>
        )}

        {error ? (
          <div className="scanner-error">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
            {!hasCamera && (
              <p style={{ fontSize: '0.85rem', marginTop: '8px', opacity: 0.8 }}>
                You can enter the box code manually below.
              </p>
            )}
            <button onClick={handleRetry} className="retry-btn">
              Try Again
            </button>
          </div>
        ) : (
          <>
            {!isLoading && (
              <div className="scanner-instructions">
                <p>Point your camera at a QR code</p>
              </div>
            )}

            <div className="qr-reader" style={{ display: isLoading ? 'none' : 'block' }}>
              <video
                ref={videoRef}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  backgroundColor: '#000'
                }}
              />
            </div>

            {!isLoading && hasTorch && (
              <div className="scanner-controls">
                <button
                  onClick={toggleTorch}
                  className={`torch-btn ${torchOn ? 'active' : ''}`}
                >
                  {torchOn ? '🔦 Light On' : '💡 Light Off'}
                </button>
              </div>
            )}
          </>
        )}

        {/* Manual Input Section */}
        <div className="manual-input-section">
          {!showManualInput ? (
            <button
              className="manual-input-toggle"
              onClick={() => setShowManualInput(true)}
            >
              Enter code manually
            </button>
          ) : (
            <form onSubmit={handleManualSubmit} className="manual-input-form">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter box code"
                className="manual-input"
                autoFocus
              />
              <button
                type="submit"
                className="manual-submit"
                disabled={!manualCode.trim()}
              >
                Go
              </button>
            </form>
          )}
        </div>

        {!error && !isLoading && (
          <div className="scanner-tips">
            <div className="tip">💡 Hold device steady</div>
            <div className="tip">💡 Ensure good lighting</div>
            <div className="tip">💡 Position QR code in frame</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
