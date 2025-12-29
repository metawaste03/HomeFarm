
import React, { useState } from 'react';
import { GoogleIcon, CameraIcon, BellIcon } from './icons';
import { auth } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import VerificationScreen from './VerificationScreen';

type AuthMode = 'signin' | 'signup' | 'forgot-password' | 'reset-sent';

const LoginScreen: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      // Note: In some environments, signInWithRedirect might be preferred, 
      // but signInWithPopup is more common for web apps.
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Google Auth Error:", err.code, err.message);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError("Failed to sign in with Google. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMode('reset-sent');
    } catch (err: any) {
      console.error("Reset Error:", err.code, err.message);
      if (err.code === 'auth/user-not-found') {
        setError("No account found with this email.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Invalid email address format.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'forgot-password') {
      return handleForgotPassword(e);
    }

    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password !== repeatPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await sendEmailVerification(user);
        await signOut(auth);
        setVerificationEmail(email);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
          await sendEmailVerification(user);
          await signOut(auth);
          setVerificationEmail(email);
        }
      }
    } catch (err: any) {
      console.error("Auth Error:", err.code, err.message);
      const errorCode = err.code;

      if (mode === 'signup') {
        if (errorCode === 'auth/email-already-in-use') {
          setError("User already exists. Sign in?");
        } else if (errorCode === 'auth/invalid-email') {
          setError("Invalid email address format.");
        } else if (errorCode === 'auth/weak-password') {
          setError("Password is too weak. Use at least 6 characters.");
        } else {
          setError("An error occurred during signup. Please try again.");
        }
      } else {
        if (errorCode === 'auth/invalid-credential' || 
            errorCode === 'auth/user-not-found' || 
            errorCode === 'auth/wrong-password') {
          setError("Password or Email Incorrect");
        } else if (errorCode === 'auth/invalid-email') {
          setError("Invalid email address format.");
        } else if (errorCode === 'auth/too-many-requests') {
          setError("Too many failed attempts. Please try again later.");
        } else {
          setError("An error occurred during sign-in. Please try again.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (verificationEmail) {
    return (
      <VerificationScreen 
        email={verificationEmail} 
        onBackToLogin={() => setVerificationEmail(null)} 
      />
    );
  }

  if (mode === 'reset-sent') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 animate-fade-in">
        <div className="w-full max-w-sm bg-card rounded-2xl shadow-xl p-8 border border-border text-center">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <BellIcon className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-4">Check your inbox</h2>
          <p className="text-text-secondary mb-8 leading-relaxed">
            We sent you a password change link to <span className="font-bold text-text-primary">{email}</span>. Verify it and log in.
          </p>
          <button
            onClick={() => handleModeChange('signin')}
            className="w-full bg-primary text-white font-bold py-4 px-4 rounded-xl text-lg hover:bg-primary-600 active:scale-95 transition-all shadow-lg"
          >
            SIGN IN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 animate-fade-in">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
           <h1 className="text-4xl font-bold text-primary">HomeFarm</h1>
           <p className="text-text-secondary mt-2">Your Farm's Data, Simplified.</p>
        </div>
        
        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className={`p-3 rounded-lg text-sm font-semibold text-center ${error.includes('Sign in?') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' : 'bg-red-100 text-danger dark:bg-red-900/30'}`}>
                {error}
                {error.includes('Sign in?') && (
                  <button type="button" onClick={() => handleModeChange('signin')} className="block w-full mt-2 underline font-bold">Click here to Sign In</button>
                )}
              </div>
            )}

            {mode === 'signup' && (
              <>
                <div className="flex flex-col items-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border overflow-hidden cursor-pointer hover:border-primary transition-colors">
                    <CameraIcon className="w-8 h-8 text-text-secondary" />
                  </div>
                  <span className="text-xs text-text-secondary mt-2">Upload Profile Photo</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Femi Adebayo"
                    className="w-full p-3 border border-border rounded-xl bg-background text-text-primary focus:ring-2 focus:ring-primary outline-none transition-all"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full p-3 border border-border rounded-xl bg-background text-text-primary focus:ring-2 focus:ring-primary outline-none transition-all"
                required
              />
            </div>

            {mode !== 'forgot-password' && (
              <div>
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Password</label>
                  {mode === 'signin' && <button type="button" onClick={() => handleModeChange('forgot-password')} className="text-xs text-primary hover:underline font-bold">Forgot?</button>}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 border border-border rounded-xl bg-background text-text-primary focus:ring-2 focus:ring-primary outline-none transition-all"
                  required
                />
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Repeat Password</label>
                <input
                  type="password"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 border border-border rounded-xl bg-background text-text-primary focus:ring-2 focus:ring-primary outline-none transition-all"
                  required
                />
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-bold py-4 px-4 rounded-xl text-lg hover:bg-primary-600 active:scale-95 transition-all shadow-lg flex items-center justify-center"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                mode === 'signup' ? 'CREATE ACCOUNT' : mode === 'forgot-password' ? 'GET RESET LINK' : 'SIGN IN'
              )}
            </button>

            {mode === 'forgot-password' && (
              <button
                type="button"
                onClick={() => handleModeChange('signin')}
                className="w-full text-center text-sm font-bold text-text-secondary hover:text-primary transition-colors"
              >
                Back to Sign In
              </button>
            )}
          </form>

          {mode !== 'forgot-password' && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-2 text-text-secondary font-bold uppercase">or</span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-card border border-border text-text-primary font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-muted transition-all active:scale-95 disabled:opacity-50"
              >
                <GoogleIcon className="w-5 h-5" />
                {loading ? 'Processing...' : 'Continue with Google'}
              </button>
            </>
          )}
        </div>

        <div className="text-center mt-8">
          <p className="text-text-secondary text-sm">
            {mode === 'signup' ? 'Already have an account?' : mode === 'signin' ? "Don't have an account yet?" : ""}
            {(mode === 'signin' || mode === 'signup') && (
              <button onClick={() => handleModeChange(mode === 'signup' ? 'signin' : 'signup')} className="font-bold text-primary hover:underline ml-2">
                {mode === 'signup' ? 'Sign In' : 'Sign Up'}
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
