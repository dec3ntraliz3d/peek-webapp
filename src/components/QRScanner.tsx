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
    console.log('Initializing QR scanner...');
    
    // Check if we're in a PWA on iOS Safari
    const isIOSPWA = () => {
      return (window.navigator as any).standalone === true && 
             /iPad|iPhone|iPod/.test(navigator.userAgent);
    };
    
    // Request camera permission explicitly for Safari/PWA
    const requestCameraAndStart = async () => {
      try {
        console.log('Requesting camera permission...');
        
        // For iOS PWA, we need to be more explicit about permissions
        if (isIOSPWA()) {
          console.log('Detected iOS PWA, using enhanced permission flow...');
          
          // First check if permissions API is available
          if ('permissions' in navigator) {
            try {
              const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
              console.log('Camera permission status:', permission.state);
              
              if (permission.state === 'denied') {
                setError('Camera access is blocked. Please go to Safari Settings > Website Settings > Camera and allow access for this site.');
                return;
              }
            } catch (permError) {
              console.log('Permissions API not fully supported, proceeding with getUserMedia...');
            }
          }
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        console.log('Camera permission granted, stopping test stream');
        stream.getTracks().forEach(track => track.stop());
        
        // Small delay to ensure camera is properly released
        setTimeout(() => {
          startScanner();
        }, 100);
        
      } catch (error: any) {
        console.error('Camera permission failed:', error);
        
        let errorMessage = 'Camera access denied. ';
        
        if (error.name === 'NotAllowedError') {
          if (isIOSPWA()) {
            errorMessage += 'For iPhone Safari PWA: Go to Safari Settings → Website Settings → Camera and allow access for this site.';
          } else {
            errorMessage += 'Please allow camera permissions and refresh the page.';
          }
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found on this device.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera is being used by another application. Please close other camera apps and try again.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Camera access is not supported on this device or browser.';
        } else {
          errorMessage += 'Please check your camera permissions and try again.';
        }
        
        setError(errorMessage);
      }
    };
    
    const startScanner = () => {
      // Enhanced configuration for PWA and Safari
      const config = {
        fps: 10,
        qrbox: { width: 280, height: 280 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: false,
        rememberLastUsedCamera: false,
        // Enhanced video constraints for PWA
        videoConstraints: {
          facingMode: "environment",
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        },
        // Additional PWA-friendly settings
        useBarCodeDetectorIfSupported: false, // More compatible across devices
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: false
        }
      };

      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        config,
        true // Enable verbose logging
      );

      scannerRef.current = scanner;

    const onScanSuccess = (decodedText: string) => {
      console.log('QR code scanned:', decodedText);
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
      console.log('Scan error:', errorMessage);
      
      // Only show real errors, not scanning attempts
      if (errorMessage.includes('NotFoundException') || 
          errorMessage.includes('No MultiFormat Readers') ||
          errorMessage.includes('parse error')) {
        return;
      }
      
      if (errorMessage.includes('NotAllowedError') || errorMessage.includes('Permission denied')) {
        console.error('Camera permission denied');
        setError('Camera access denied. Please allow camera permissions in your browser settings.');
      } else if (errorMessage.includes('NotFoundError')) {
        console.error('No camera found');
        setError('No camera found on this device.');
      } else {
        console.error('Other camera error:', errorMessage);
        setError('Camera error. Please try again.');
      }
    };

      console.log('Starting scanner render...');
      scanner.render(onScanSuccess, onScanError);
    };
    
    // Start the camera permission request
    requestCameraAndStart();

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
            <div style={{marginTop: '16px', fontSize: '0.9rem', color: '#ccc'}}>
              <p><strong>iPhone Safari PWA Instructions:</strong></p>
              <p>1. Open Safari Settings</p>
              <p>2. Scroll to "Website Settings"</p>
              <p>3. Tap "Camera"</p>
              <p>4. Find this website and set to "Allow"</p>
              <p>5. Return to this app and refresh</p>
              <br />
              <p><strong>Alternative:</strong> If you're not in PWA mode, try opening this in Safari browser first to grant permissions, then return to the PWA.</p>
            </div>
            <button onClick={() => {
              setError('');
              window.location.reload();
            }} className="retry-btn">
              Refresh Page
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