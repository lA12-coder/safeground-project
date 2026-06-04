'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BreathingCircle } from './BreathingCircle';
import { CopingStepCard, CopingStep } from './CopingStepCard';

type Phase = 0 | 1 | 2 | 3; 

export function PanicModal({ isOpen, onClose, userId = 'anonymous' }: { isOpen: boolean, onClose: () => void, userId?: string }) {
  const [phase, setPhase] = useState<Phase>(0);
  const [sessionData, setSessionData] = useState<{ id: string, steps: CopingStep[], affirmation: string } | null>(null);
  const [urgeStartTime, setUrgeStartTime] = useState<number>(Date.now());

  useEffect(() => {
    if (isOpen) {
      setPhase(1);
      
      const start = Date.now();
      setUrgeStartTime(start);
      localStorage.setItem('safeground_panic_active', 'true');
      localStorage.setItem('safeground_panic_start', start.toString());

      fetch('/api/panic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, intensity: 8, context_tags: ['mobile-button'] })
      })
      .then(r => r.json())
      .then(data => {
        if (data.session_id) {
          setSessionData({ id: data.session_id, steps: data.steps, affirmation: data.affirmation });
        }
      })
      .catch(err => console.error('Panic initial API error:', err));
    } else {
      setPhase(0);
      setSessionData(null);
      localStorage.removeItem('safeground_panic_active');
      localStorage.removeItem('safeground_panic_start');
      localStorage.removeItem('safeground_panic_step');
    }
  }, [isOpen, userId]);

  const handleBreathingComplete = () => {
    setPhase(2);
  };

  const handleCompleteSession = async (completedSteps: number) => {
    setPhase(3);
    localStorage.removeItem('safeground_panic_active');
    
    if (sessionData?.id) {
      await fetch('/api/panic/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionData.id, completed_steps: completedSteps })
      }).catch(console.error);
    }
  };

  const handleCancel = () => {
    handleCompleteSession(0); 
  };

  if (!isOpen && phase === 0) return null;

  return (
    <AnimatePresence>
      {phase !== 0 && (
        <motion.div 
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-50 bg-surface flex flex-col overflow-y-auto sm:p-4"
        >
          <div className="flex-1 w-full max-w-md mx-auto bg-surface-container-lowest sm:rounded-3xl sm:shadow-2xl overflow-hidden relative sm:my-auto sm:border sm:border-outline-variant flex flex-col pt-8 sm:pt-4">
            
            {phase === 1 && (
              <BreathingCircle onComplete={handleBreathingComplete} urgeStartTime={urgeStartTime} />
            )}

            {phase === 2 && sessionData?.steps && (
              <CopingStepCard 
                steps={sessionData.steps} 
                onComplete={handleCompleteSession}
                onCancel={handleCancel}
              />
            )}

            {phase === 2 && !sessionData?.steps && (
              <div className="flex-1 flex items-center justify-center min-h-[60vh] flex-col gap-4">
                <div className="w-8 h-8 border-4 border-[#8d4b00] border-t-transparent rounded-full animate-spin" />
                <p className="text-on-surface-variant font-medium">Preparing your coping plan...</p>
              </div>
            )}

            {phase === 3 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="w-24 h-24 bg-secondary-container rounded-full flex items-center justify-center mb-6 relative">
                  <motion.div 
                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                    className="absolute inset-0 border-4 border-dashed border-[#8d4b00]/30 rounded-full"
                  />
                  <span className="text-5xl">🌟</span>
                </div>
                
                <h2 className="text-4xl font-serif font-bold text-on-surface mb-2">
                  You Held Your Ground
                </h2>
                
                <div className="inline-block px-4 py-2 bg-amber-100 text-amber-800 rounded-full font-bold text-sm mb-6 border border-amber-200">
                  Streak Protected
                </div>
                
                <p className="text-lg text-on-surface-variant mb-8 italic px-4">
                  "{sessionData?.affirmation || 'You are stronger than the urge.'}"
                </p>

                <button 
                  onClick={onClose}
                  className="w-full py-4 bg-[#8d4b00] hover:bg-[#b15f00] text-white rounded-full font-bold text-lg transition-all shadow-md active:scale-95"
                >
                  Return to Dashboard
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
