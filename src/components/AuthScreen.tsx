import { useState } from 'react';
import { AuthService } from '../services/AuthService';

interface AuthScreenProps {
  onAuthenticated: () => void;
}

type AuthMode = 'main' | 'email-signin' | 'email-signup' | 'magic-link';

function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('main');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await AuthService.signInWithGoogle();
      onAuthenticated();
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/popup-closed-by-user') {
        // User closed popup, not an error
        return;
      }
      setError(error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await AuthService.signInWithEmail(email, password);
      onAuthenticated();
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else if (error.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else {
        setError(error.message || 'Failed to sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await AuthService.signUpWithEmail(email, password);
      onAuthenticated();
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/email-already-in-use') {
        setError('An account already exists with this email');
      } else if (error.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters');
      } else {
        setError(error.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await AuthService.sendMagicLink(email);
      setMagicLinkSent(true);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to send sign-in link');
    } finally {
      setLoading(false);
    }
  };

  const renderMainScreen = () => (
    <>
      <div className="auth-logo">
        <span className="logo-icon">📦</span>
        <h1>Peek</h1>
        <p>Track what's inside your boxes</p>
      </div>

      <div className="auth-buttons">
        <button
          className="auth-btn google-btn"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg className="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button
          className="auth-btn email-btn"
          onClick={() => setMode('email-signin')}
        >
          Sign in with Email
        </button>

        <button
          className="auth-btn magic-btn"
          onClick={() => setMode('magic-link')}
        >
          Passwordless Sign In
        </button>
      </div>

      <p className="auth-footer">
        Don't have an account?{' '}
        <button className="link-btn" onClick={() => setMode('email-signup')}>
          Create one
        </button>
      </p>
    </>
  );

  const renderEmailSignIn = () => (
    <>
      <button className="back-link" onClick={() => { setMode('main'); setError(''); }}>
        ← Back
      </button>

      <div className="auth-header">
        <h2>Sign In</h2>
        <p>Welcome back</p>
      </div>

      <form onSubmit={handleEmailSignIn} className="auth-form">
        <div className="input-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="input-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="auth-error">{error}</div>}
        <button type="submit" className="auth-btn primary-btn" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="auth-footer">
        New to Peek?{' '}
        <button className="link-btn" onClick={() => { setMode('email-signup'); setError(''); }}>
          Create account
        </button>
      </p>
    </>
  );

  const renderEmailSignUp = () => (
    <>
      <button className="back-link" onClick={() => { setMode('main'); setError(''); }}>
        ← Back
      </button>

      <div className="auth-header">
        <h2>Create Account</h2>
        <p>Start tracking your boxes</p>
      </div>

      <form onSubmit={handleEmailSignUp} className="auth-form">
        <div className="input-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="input-group">
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        {error && <div className="auth-error">{error}</div>}
        <button type="submit" className="auth-btn primary-btn" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="auth-footer">
        Already have an account?{' '}
        <button className="link-btn" onClick={() => { setMode('email-signin'); setError(''); }}>
          Sign in
        </button>
      </p>
    </>
  );

  const renderMagicLink = () => (
    <>
      <button className="back-link" onClick={() => { setMode('main'); setError(''); setMagicLinkSent(false); }}>
        ← Back
      </button>

      <div className="auth-header">
        <h2>Passwordless Sign In</h2>
        <p>We'll send you a sign-in link</p>
      </div>

      {magicLinkSent ? (
        <div className="magic-link-sent">
          <div className="sent-icon">✉️</div>
          <h3>Check your email</h3>
          <p>We sent a sign-in link to <strong>{email}</strong></p>
          <p className="hint">Click the link in the email to sign in</p>
        </div>
      ) : (
        <form onSubmit={handleMagicLink} className="auth-form">
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="auth-btn primary-btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send Sign-In Link'}
          </button>
        </form>
      )}
    </>
  );

  return (
    <div className="auth-container">
      <div className="auth-card">
        {mode === 'main' && renderMainScreen()}
        {mode === 'email-signin' && renderEmailSignIn()}
        {mode === 'email-signup' && renderEmailSignUp()}
        {mode === 'magic-link' && renderMagicLink()}
      </div>
    </div>
  );
}

export default AuthScreen;
