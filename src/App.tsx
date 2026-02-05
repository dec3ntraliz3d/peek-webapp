import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import AuthScreen from './components/AuthScreen';
import QRScanner from './components/QRScanner';
import BoxContents from './components/BoxContents';
import QRGenerator from './components/QRGenerator';
import { AuthService } from './services/AuthService';
import { FirebaseStorage } from './services/FirebaseStorage';
import './App.css';

type Screen = 'home' | 'scanner' | 'contents' | 'generator';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [currentBoxId, setCurrentBoxId] = useState('');
  const [boxItems, setBoxItems] = useState<string[]>([]);
  const [boxDescription, setBoxDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check for magic link on load
  useEffect(() => {
    const url = window.location.href;
    if (AuthService.isSignInWithEmailLink(url)) {
      AuthService.completeMagicLinkSignIn(url)
        .then(() => {
          // Clear URL after sign-in
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch((error) => {
          console.error('Magic link sign-in failed:', error);
        });
    }
  }, []);

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((user) => {
      setUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
      setCurrentScreen('home');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const loadBoxItems = async (boxId: string) => {
    setIsLoading(true);
    try {
      const items = await FirebaseStorage.getBoxItems(boxId);
      const description = await FirebaseStorage.getBoxDescription(boxId);
      setBoxItems(items);
      setBoxDescription(description);
    } catch (error) {
      console.error('Error loading box items:', error);
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
    await FirebaseStorage.addItemToBox(boxId, item);
    await loadBoxItems(boxId);
  };

  const handleRemoveItem = async (boxId: string, item: string) => {
    await FirebaseStorage.removeItemFromBox(boxId, item);
    await loadBoxItems(boxId);
  };

  const handleUpdateDescription = async (boxId: string, description: string) => {
    await FirebaseStorage.setBoxDescription(boxId, description);
    setBoxDescription(description);
  };

  const renderHomeScreen = () => (
    <div className="home-container">
      <div className="home-header">
        <h1>Peek</h1>
        <p>Track what's inside your boxes</p>
        <button
          onClick={handleSignOut}
          className="sign-out-btn"
          title="Sign out"
        >
          Sign Out
        </button>
      </div>

      <div className="home-actions">
        <button
          className="action-button primary"
          onClick={() => setCurrentScreen('scanner')}
        >
          <span className="button-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/>
              <rect x="7" y="7" width="10" height="10" rx="1"/>
            </svg>
          </span>
          <span className="button-text">Scan QR Code</span>
          <span className="button-subtitle">View box contents</span>
        </button>

        <button
          className="action-button secondary"
          onClick={() => setCurrentScreen('generator')}
        >
          <span className="button-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
            </svg>
          </span>
          <span className="button-text">Generate QR Code</span>
          <span className="button-subtitle">Create labels for boxes</span>
        </button>
      </div>

      <div className="home-footer">
        <p>Signed in as {user?.email || 'Guest'}</p>
      </div>
    </div>
  );

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="app">
        <div className="auth-loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!user) {
    return (
      <div className="app">
        <AuthScreen onAuthenticated={() => {}} />
      </div>
    );
  }

  const renderCurrentScreen = () => {
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
            description={boxDescription}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            onUpdateDescription={handleUpdateDescription}
            onBack={() => setCurrentScreen('home')}
            isLoading={isLoading}
          />
        );
      case 'generator':
        return <QRGenerator onBack={() => setCurrentScreen('home')} />;
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
