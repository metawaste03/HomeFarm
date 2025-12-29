
import React from 'react';
import { BellIcon } from './icons';

interface VerificationScreenProps {
  email: string;
  onBackToLogin: () => void;
}

const VerificationScreen: React.FC<VerificationScreenProps> = ({ email, onBackToLogin }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-card rounded-2xl shadow-xl p-8 border border-border text-center">
        <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <BellIcon className="w-10 h-10 text-primary" />
        </div>
        
        <h2 className="text-2xl font-bold text-text-primary mb-4">Check your email</h2>
        <p className="text-text-secondary mb-8 leading-relaxed">
          We have sent you a verification email to <span className="font-bold text-text-primary">{email}</span>. 
          Verify it and log in to access your farm dashboard.
        </p>

        <button
          onClick={onBackToLogin}
          className="w-full bg-primary text-white font-bold py-4 px-4 rounded-xl text-lg hover:bg-primary-600 active:scale-95 transition-all shadow-lg"
        >
          LOG IN
        </button>
        
        <p className="mt-6 text-sm text-text-secondary">
          Didn't receive the email? <button onClick={() => window.location.reload()} className="text-primary font-bold hover:underline">Try again</button>
        </p>
      </div>
    </div>
  );
};

export default VerificationScreen;
