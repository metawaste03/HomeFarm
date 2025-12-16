import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '../firebase';
import { GoogleIcon } from './icons';

interface LoginScreenProps {
  onLogin?: () => void;
  onSignup?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = () => {
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');

  const handleSignUp = async () => {
    setIsLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Ideally, update profile with fullName here: await updateProfile(userCredential.user, { displayName: fullName });

      await sendEmailVerification(userCredential.user);
      setInfoMessage('Account created! Please check your email for a verification link.');
      // We don't necessarily need to auto-navigate, the Auth Listener in App.tsx will pick this up
      // and show the verification screen if we are logged in but unverified.
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Success - App.tsx listener handles navigation
    } catch (err: any) {
      console.error(err);
      setError('Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      setError('Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSigningUp) {
      handleSignUp();
    } else {
      handleSignIn();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary">HomeFarm</h1>
          <p className="text-text-secondary mt-2">Your Farm's Data, Simplified.</p>
        </div>

        <div className="bg-card rounded-xl shadow-lg p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-danger text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}
          {infoMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 text-sm rounded-lg border border-green-200">
              {infoMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSigningUp && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Femi Adebayo"
                  className="w-full p-3 border border-border rounded-lg bg-background text-text-primary focus:ring-2 focus:ring-primary"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                // required // Name not strictly required for Auth, make optional or enforce if profile update logic added
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full p-3 border border-border rounded-lg bg-background text-text-primary focus:ring-2 focus:ring-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
                {!isSigningUp && <a href="#" className="text-sm text-primary hover:underline">Forgot?</a>}
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full p-3 border border-border rounded-lg bg-background text-text-primary focus:ring-2 focus:ring-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl text-lg hover:bg-primary-600 active:bg-primary-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : (isSigningUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card px-2 text-text-secondary">or</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            type="button"
            className="w-full bg-card border border-border text-text-primary font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-muted transition-colors disabled:opacity-70"
          >
            <GoogleIcon className="w-5 h-5" />
            Sign in with Google
          </button>
        </div>

        <div className="text-center mt-6">
          <p className="text-text-secondary">
            {isSigningUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              type="button"
              onClick={() => { setIsSigningUp(!isSigningUp); setError(''); setInfoMessage(''); }}
              className="font-semibold text-primary hover:underline ml-2"
            >
              {isSigningUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
