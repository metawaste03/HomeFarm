
import React, { useState } from 'react';
import { GoogleIcon } from './icons';

interface LoginScreenProps {
  onLogin: () => void;
  onSignup: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSignup }) => {
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSigningUp) {
      onSignup();
    } else {
      onLogin();
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSigningUp && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Femi Adebayo"
                  className="w-full p-3 border border-border rounded-lg bg-background text-text-primary focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full p-3 border border-border rounded-lg bg-background text-text-primary focus:ring-2 focus:ring-primary"
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
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl text-lg hover:bg-primary-600 active:bg-primary-700 transition-colors"
            >
              {isSigningUp ? 'Create Account' : 'Sign In'}
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
            onClick={onLogin}
            className="w-full bg-card border border-border text-text-primary font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-muted transition-colors"
          >
            <GoogleIcon className="w-5 h-5" />
            Sign in with Google
          </button>
        </div>

        <div className="text-center mt-6">
          <p className="text-text-secondary">
            {isSigningUp ? 'Already have an account?' : "Don't have an account?"}
            <button onClick={() => setIsSigningUp(!isSigningUp)} className="font-semibold text-primary hover:underline ml-2">
              {isSigningUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
