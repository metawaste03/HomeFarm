
import React, { useState } from 'react';
import { DashboardIcon, PlusIcon, AnalyticsIcon } from './icons';

interface WelcomeGuideProps {
  onClose: () => void;
}

const guideSteps = [
  {
    title: "Welcome to HomeFarm!",
    text: "Let's take a quick tour to get you started.",
    icon: null,
  },
  {
    title: "This is your Dashboard",
    text: "It gives you an at-a-glance overview of your farm's health every day.",
    icon: DashboardIcon,
    highlight: 'bottom-nav-dashboard',
  },
  {
    title: "Log Your Daily Activities",
    text: "Tap this button to log your daily records. This is the most important button in the app!",
    icon: PlusIcon,
    highlight: 'fab',
  },
  {
    title: "Gain Powerful Insights",
    text: "Visit the Analytics tab to see your data come to life. Track your profitability and performance over time.",
    icon: AnalyticsIcon,
    highlight: 'bottom-nav-analytics',
  }
];

const WelcomeGuide: React.FC<WelcomeGuideProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const currentStep = guideSteps[step];

  const handleNext = () => {
    if (step < guideSteps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center p-4 animate-fade-in">
      <div className="bg-popover rounded-xl shadow-lg p-6 w-full max-w-sm mb-28">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-text-primary">{currentStep.title}</h3>
            <button onClick={onClose} className="text-sm text-text-secondary hover:text-text-primary font-semibold">Skip Tour</button>
        </div>
        
        <p className="text-text-secondary mb-6">{currentStep.text}</p>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-text-secondary font-medium">
            Step {step + 1} of {guideSteps.length}
          </div>
          <div className="flex gap-3">
            {step > 0 && (
              <button onClick={handleBack} className="px-4 py-2 rounded-lg text-text-primary bg-muted hover:bg-border font-semibold transition">
                Back
              </button>
            )}
            <button onClick={handleNext} className="px-4 py-2 rounded-lg text-white bg-primary hover:bg-primary-600 font-semibold transition">
              {step === guideSteps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeGuide;
