import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../config/firebase';

const googleProvider = new GoogleAuthProvider();

// Email link settings
const actionCodeSettings = {
  url: window.location.origin,
  handleCodeInApp: true,
};

export const AuthService = {
  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  // Google Sign-In
  async signInWithGoogle(): Promise<User> {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  },

  // Email/Password Sign-In
  async signInWithEmail(email: string, password: string): Promise<User> {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  },

  // Email/Password Sign-Up
  async signUpWithEmail(email: string, password: string): Promise<User> {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  },

  // Send Magic Link
  async sendMagicLink(email: string): Promise<void> {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    // Save email to localStorage for verification
    window.localStorage.setItem('emailForSignIn', email);
  },

  // Check if URL is a magic link
  isSignInWithEmailLink(url: string): boolean {
    return isSignInWithEmailLink(auth, url);
  },

  // Complete magic link sign-in
  async completeMagicLinkSignIn(url: string): Promise<User> {
    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
      // If email is not in localStorage, prompt user
      email = window.prompt('Please provide your email for confirmation');
    }
    if (!email) {
      throw new Error('Email is required to complete sign-in');
    }
    const result = await signInWithEmailLink(auth, email, url);
    window.localStorage.removeItem('emailForSignIn');
    return result.user;
  },

  // Sign Out
  async signOut(): Promise<void> {
    await signOut(auth);
  }
};
