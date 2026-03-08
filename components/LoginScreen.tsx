import React, { useState } from 'react';
import { CameraIcon, BellIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';

const PRIVACY_POLICY_PREVIEW = `This privacy policy applies to the Homefarm app for mobile devices. The Application collects basic usage data (IP address, pages visited, time spent, OS type). It does not gather precise location or use AI to process your data.

The Service Provider may use your email to contact you. Only aggregated, anonymized data is shared with third parties. Data is retained as long as you use the app. You may request deletion at metawaste03@gmail.com.

The Application does not knowingly collect data from children under 13. For full details, visit Settings → Legal → Privacy Policy within the app.`;

const TERMS_PREVIEW = `By using the Homefarm app you agree to these terms. Unauthorized copying or modification of the Application is prohibited. All intellectual property remains property of the Service Provider.

The Service Provider may modify the app or introduce charges at any time (communicated clearly). You are responsible for securing your own device. Some features require internet access; data charges from your carrier may apply.

The Service Provider accepts no liability for indirect losses from relying on app data. These terms may be updated at any time. For full details, visit Settings → Legal → Terms & Conditions within the app.`;

// Google Icon component
const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

type AuthMode = 'signin' | 'signup' | 'forgot-password' | 'reset-sent' | 'verify-email';
type LegalDoc = 'privacy' | 'terms' | null;

// Modal to show legal content before user is authenticated
const LegalModal: React.FC<{ doc: LegalDoc; onClose: () => void }> = ({ doc, onClose }) => {
  if (!doc) return null;
  const isPrivacy = doc === 'privacy';
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-card w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-text-primary">
            {isPrivacy ? 'Privacy Policy' : 'Terms & Conditions'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-text-secondary hover:text-text-primary transition-colors" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-80 text-sm text-text-secondary leading-relaxed whitespace-pre-line">
          {isPrivacy ? PRIVACY_POLICY_PREVIEW : TERMS_PREVIEW}
        </div>
        <div className="p-4 border-t border-border">
          <p className="text-xs text-text-secondary text-center">Full document available in Settings → Legal after sign-in.</p>
        </div>
      </div>
    </div>
  );
};

const LoginScreen: React.FC = () => {
  const { signUp, signIn, signInWithGoogle, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [legalDoc, setLegalDoc] = useState<LegalDoc>(null);

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
      }
      // If successful, the page will redirect to Google OAuth
    } catch (err) {
      setError("An error occurred with Google Sign-In. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await resetPassword(email);
      if (error) {
        if (error.message.includes('not found')) {
          setError("No account found with this email.");
        } else {
          setError(error.message);
        }
      } else {
        setMode('reset-sent');
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
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
        if (password.length < 6) {
          setError("Password must be at least 6 characters");
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            setError("User already exists. Sign in?");
          } else if (error.message.includes('Invalid email')) {
            setError("Invalid email address format.");
          } else if (error.message.includes('Password')) {
            setError("Password is too weak. Use at least 6 characters.");
          } else {
            setError(error.message);
          }
        } else {
          setMode('verify-email');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError("Password or Email Incorrect");
          } else if (error.message.includes('Email not confirmed')) {
            setMode('verify-email');
          } else if (error.message.includes('Invalid email')) {
            setError("Invalid email address format.");
          } else if (error.message.includes('rate limit')) {
            setError("Too many failed attempts. Please try again later.");
          } else {
            setError(error.message);
          }
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Email verification screen
  if (mode === 'verify-email') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 animate-fade-in">
        <div className="w-full max-w-sm bg-card rounded-2xl shadow-xl p-8 border border-border text-center">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <BellIcon className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-4">Check your inbox</h2>
          <p className="text-text-secondary mb-8 leading-relaxed">
            We sent a confirmation link to <span className="font-bold text-text-primary">{email}</span>. Click the link to verify your email and complete sign up.
          </p>
          <button
            onClick={() => handleModeChange('signin')}
            className="w-full bg-primary text-white font-bold py-4 px-4 rounded-xl text-lg hover:bg-primary-600 active:scale-95 transition-all shadow-lg"
          >
            BACK TO SIGN IN
          </button>
        </div>
      </div>
    );
  }

  // Password reset sent screen
  if (mode === 'reset-sent') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 animate-fade-in">
        <div className="w-full max-w-sm bg-card rounded-2xl shadow-xl p-8 border border-border text-center">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <BellIcon className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-4">Check your inbox</h2>
          <p className="text-text-secondary mb-8 leading-relaxed">
            We sent you a password reset link to <span className="font-bold text-text-primary">{email}</span>. Click the link to reset your password.
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
          <img
            src="/icons/icon-192.png"
            alt="HomeFarm Logo"
            className="w-24 h-24 mx-auto mb-3 rounded-2xl shadow-lg"
          />
          <h1 className="text-4xl font-bold text-primary">HomeFarm</h1>
          <p className="text-text-secondary mt-2">Your Farm's Data, Simplified.</p>
        </div>

        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
          {/* Google Sign-In Button */}
          {(mode === 'signin' || mode === 'signup') && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full bg-white dark:bg-slate-800 border border-border text-text-primary font-semibold py-3 px-4 rounded-xl hover:bg-muted active:scale-95 transition-all flex items-center justify-center gap-3 shadow-sm"
              >
                {googleLoading ? (
                  <div className="w-5 h-5 border-2 border-text-secondary border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <GoogleIcon className="w-5 h-5" />
                    Continue with Google
                  </>
                )}
              </button>

              {/* OR Divider */}
              <div className="flex items-center gap-4 my-5">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-xs font-bold text-text-secondary uppercase">or</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>
            </>
          )}

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

            {mode === 'signup' && (
              <p className="text-xs text-text-secondary text-center px-1">
                By creating an account, you agree to our{' '}
                <button type="button" onClick={() => setLegalDoc('terms')} className="font-semibold text-primary hover:underline">Terms &amp; Conditions</button>
                {' '}and{' '}
                <button type="button" onClick={() => setLegalDoc('privacy')} className="font-semibold text-primary hover:underline">Privacy Policy</button>.
              </p>
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
      <LegalModal doc={legalDoc} onClose={() => setLegalDoc(null)} />
    </div>
  );
};

export default LoginScreen;
