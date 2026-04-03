import React, { useState } from 'react';
import { WelcomeStep } from './WelcomeStep';
import { ProfileStep } from './ProfileStep';
import { ShowSelectorStep } from './ShowSelectorStep';
import { CompleteStep } from './CompleteStep';
import { useStore } from '../../store/useStore';
import { Sparkles } from '../UI/Sparkles';

type SetupStep = 'welcome' | 'profile' | 'shows' | 'complete';

export const SetupWizard: React.FC = () => {
  const [step, setStep] = useState<SetupStep>('welcome');
  const { setProfile, setCurrentView } = useStore();

  const handleEnter = () => {
    setProfile({ setupComplete: true });
    setCurrentView('epg');
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Background sparkles always present */}
      <Sparkles count={15} />

      {/* Background gradient */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background:
            'radial-gradient(ellipse at 20% 50%, rgba(255,45,120,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(0,229,255,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {step === 'welcome' && <WelcomeStep onNext={() => setStep('profile')} />}
      {step === 'profile' && (
        <ProfileStep onNext={() => setStep('shows')} onBack={() => setStep('welcome')} />
      )}
      {step === 'shows' && (
        <ShowSelectorStep onNext={() => setStep('complete')} onBack={() => setStep('profile')} />
      )}
      {step === 'complete' && <CompleteStep onEnter={handleEnter} />}
    </div>
  );
};
