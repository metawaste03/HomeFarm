import React, { useState } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase';

interface VerifyEmailScreenProps {
    userEmail: string | null;
    onLogOut: () => void;
}

const VerifyEmailScreen: React.FC<VerifyEmailScreenProps> = ({ userEmail, onLogOut }) => {
    const [isResending, setIsResending] = useState(false);
    const [message, setMessage] = useState('');

    const handleResend = async () => {
        if (!auth.currentUser) return;
        setIsResending(true);
        setMessage('');
        try {
            await sendEmailVerification(auth.currentUser);
            setMessage('Verification email sent! Please check your inbox.');
        } catch (error: any) {
            console.error("Error resending verification email:", error);
            if (error.code === 'auth/too-many-requests') {
                setMessage('Too many requests. Please wait a moment before trying again.');
            } else {
                setMessage('Failed to resend email. Please try again later.');
            }
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <div className="w-full max-w-md bg-card rounded-xl shadow-lg p-8 text-center">
                <div className="mb-6 flex justify-center">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
                        <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-text-primary mb-2">Verify Your Email</h2>
                <p className="text-text-secondary mb-6">
                    We've sent a verification link to <span className="font-semibold text-text-primary">{userEmail}</span>.
                    <br />
                    Please check your inbox and click the link to continue.
                </p>

                {message && (
                    <div className={`mb-6 p-3 rounded-lg text-sm ${message.includes('sent') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-danger dark:bg-red-900/30 dark:text-red-300'}`}>
                        {message}
                    </div>
                )}

                <button
                    onClick={handleResend}
                    disabled={isResending}
                    className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl text-lg hover:bg-primary-600 active:bg-primary-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mb-4"
                >
                    {isResending ? 'Sending...' : 'Resend Verification Email'}
                </button>

                <button
                    onClick={onLogOut}
                    className="text-text-secondary hover:text-text-primary font-semibold text-sm"
                >
                    Log Out
                </button>
            </div>
        </div>
    );
};

export default VerifyEmailScreen;
