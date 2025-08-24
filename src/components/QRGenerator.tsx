import React, { useState, useRef } from 'react';
import QRCode from 'qrcode';

interface QRGeneratorProps {
  onBack: () => void;
}

const QRGenerator: React.FC<QRGeneratorProps> = ({ onBack }) => {
  const [boxId, setBoxId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQR = async () => {
    if (!boxId.trim()) {
      console.log('No box ID provided');
      return;
    }

    console.log('Generating QR for box ID:', boxId.trim());
    setIsGenerating(true);
    try {
      const canvas = canvasRef.current;
      console.log('Canvas element:', canvas);
      if (canvas) {
        console.log('Generating QR to canvas...');
        await QRCode.toCanvas(canvas, boxId.trim(), {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        console.log('Canvas QR generated successfully');
        
        // Also generate a data URL for download
        console.log('Generating data URL...');
        const url = await QRCode.toDataURL(boxId.trim(), {
          width: 512,
          margin: 2,
        });
        console.log('Data URL generated:', url.substring(0, 50) + '...');
        setQrCodeUrl(url);
      } else {
        console.error('Canvas ref is null');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Error generating QR code: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `box-${boxId}-qr.png`;
    link.click();
  };

  const printQR = () => {
    if (!canvasRef.current) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL();
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Box ${boxId} - QR Code</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                text-align: center; 
                font-family: Arial, sans-serif;
              }
              .qr-container { 
                page-break-inside: avoid; 
                margin-bottom: 30px;
              }
              img { 
                max-width: 200px; 
                height: auto; 
              }
              h2 { 
                margin: 10px 0; 
                font-size: 18px;
              }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h2>Box: ${boxId}</h2>
              <img src="${dataUrl}" alt="QR Code for Box ${boxId}" />
              <p>Scan with Peek app</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generateRandomId = () => {
    const id = 'BOX-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    setBoxId(id);
  };

  return (
    <div className="generator-container">
      <div className="generator-header">
        <button onClick={onBack} className="back-btn">
          ← Back
        </button>
        <h2>Generate QR Code</h2>
      </div>

      <div className="generator-content">
        <div className="input-section">
          <div className="form-group">
            <label htmlFor="boxId">Box ID</label>
            <div className="input-with-button">
              <input
                type="text"
                id="boxId"
                value={boxId}
                onChange={(e) => setBoxId(e.target.value)}
                placeholder="Enter box identifier"
                onKeyPress={(e) => e.key === 'Enter' && generateQR()}
              />
              <button 
                onClick={generateRandomId}
                className="random-btn"
                type="button"
              >
                🎲
              </button>
            </div>
            <small>Use a unique identifier for each box (e.g., "KITCHEN-01", "GARAGE-A1")</small>
          </div>

          <button 
            onClick={generateQR}
            disabled={!boxId.trim() || isGenerating}
            className="generate-btn"
          >
            {isGenerating ? 'Generating...' : 'Generate QR Code'}
          </button>
        </div>

        <div className="qr-result" style={{ display: qrCodeUrl ? 'block' : 'none' }}>
          <div className="qr-display">
            <canvas ref={canvasRef} className="qr-canvas"></canvas>
            <p className="box-label">Box: {boxId}</p>
          </div>

            <div className="qr-actions">
              <button onClick={printQR} className="action-btn print-btn">
                🖨️ Print QR Code
              </button>
              <button onClick={downloadQR} className="action-btn download-btn">
                💾 Download PNG
              </button>
            </div>

            <div className="print-tips">
              <h4>💡 Printing Tips:</h4>
              <ul>
                <li>Print on white paper or sticker labels</li>
                <li>Ensure good contrast (black on white)</li>
                <li>Test scan after printing</li>
                <li>Laminate for durability</li>
              </ul>
            </div>
          </div>
      </div>
    </div>
  );
};

export default QRGenerator;