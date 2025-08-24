import { useState, useEffect } from 'react';
import GitHubSetup from './components/GitHubSetup';
import QRScanner from './components/QRScanner';
import BoxContents from './components/BoxContents';
import QRGenerator from './components/QRGenerator';
import { initializeStorage, getStorageService, isStorageConfigured, clearStorageConfig } from './services/GitHubStorage';
import './App.css';

type Screen = 'home' | 'scanner' | 'contents' | 'generator' | 'setup';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [isConfigured, setIsConfigured] = useState(false);
  const [currentBoxId, setCurrentBoxId] = useState('');
  const [boxItems, setBoxItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsConfigured(isStorageConfigured());
  }, []);

  const handleGitHubConfig = (token: string, owner: string, repo: string) => {
    initializeStorage(token, owner, repo);
    setIsConfigured(true);
  };

  const handleReconfigure = () => {
    clearStorageConfig();
    setIsConfigured(false);
    setCurrentScreen('setup');
  };

  const loadBoxItems = async (boxId: string) => {
    setIsLoading(true);
    try {
      const storage = getStorageService();
      const items = await storage.getBoxItems(boxId);
      setBoxItems(items);
    } catch (error) {
      console.error('Error loading box items:', error);
      alert('Failed to load box items. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRScan = async (data: string) => {
    setCurrentBoxId(data);
    await loadBoxItems(data);
    setCurrentScreen('contents');
  };

  const handleAddItem = async (boxId: string, item: string) => {
    const storage = getStorageService();
    await storage.addItemToBox(boxId, item);
    await loadBoxItems(boxId);
  };

  const handleRemoveItem = async (boxId: string, item: string) => {
    const storage = getStorageService();
    await storage.removeItemFromBox(boxId, item);
    await loadBoxItems(boxId);
  };

  const renderHomeScreen = () => (
    <div className="home-container">
      <div className="home-header">
        <h1>📦 Peek</h1>
        <p>Track what's inside your boxes</p>
        <button 
          onClick={handleReconfigure}
          className="config-btn"
          title="Reconfigure GitHub settings"
        >
          ⚙️
        </button>
      </div>
      
      <div className="home-actions">
        <button
          className="action-button primary"
          onClick={() => setCurrentScreen('scanner')}
        >
          <span className="button-icon">📱</span>
          <span className="button-text">Scan QR Code</span>
          <span className="button-subtitle">View box contents</span>
        </button>

        <button
          className="action-button secondary"
          onClick={() => setCurrentScreen('generator')}
        >
          <span className="button-icon">🏷️</span>
          <span className="button-text">Generate QR Code</span>
          <span className="button-subtitle">Create labels for boxes</span>
        </button>
      </div>

      <div className="home-footer">
        <p>💾 Data stored securely in your private GitHub repository</p>
      </div>
    </div>
  );

  const renderCurrentScreen = () => {
    if (!isConfigured) {
      return <GitHubSetup onConfigured={handleGitHubConfig} />;
    }

    switch (currentScreen) {
      case 'home':
        return renderHomeScreen();
      case 'scanner':
        return <QRScanner onScan={handleQRScan} onBack={() => setCurrentScreen('home')} />;
      case 'contents':
        return (
          <BoxContents
            boxId={currentBoxId}
            items={boxItems}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            onBack={() => setCurrentScreen('home')}
            isLoading={isLoading}
          />
        );
      case 'generator':
        return <QRGenerator onBack={() => setCurrentScreen('home')} />;
      case 'setup':
        return <GitHubSetup onConfigured={handleGitHubConfig} />;
      default:
        return renderHomeScreen();
    }
  };

  return (
    <div className="app">
      {renderCurrentScreen()}
    </div>
  );
}

export default App;
