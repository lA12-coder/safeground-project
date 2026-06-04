'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Wind, Activity, HeartHandshake, Sparkles } from 'lucide-react';

export type CopingStep = {
  title: string;
  instruction: string;
  duration_seconds: number;
};

const getIcon = (index: number) => {
  switch (index) {
    case 0: return <Eye className="w-5 h-5" />;
    case 1: return <Wind className="w-5 h-5" />;
    case 2: return <Activity className="w-5 h-5" />;
    case 3: return <HeartHandshake className="w-5 h-5" />;
    case 4: return <Sparkles className="w-5 h-5" />;
    default: return <Eye className="w-5 h-5" />;
  }
};

export function CopingStepCard({ 
  steps, 
  onComplete,
  onCancel
}: { 
  steps: CopingStep[], 
  onComplete: (completedCount: number) => void,
  onCancel: () => void 
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    if (!currentStep) return;
    
    setTimeLeft(currentStep.duration_seconds || 90);
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(i => i + 1);
            return steps[currentStepIndex + 1]?.duration_seconds || 90;
          } else {
            clearInterval(timer);
            onComplete(steps.length);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStepIndex, steps, onComplete]);

  if (!currentStep) return null;

  const progress = ((currentStep.duration_seconds - timeLeft) / currentStep.duration_seconds) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col min-h-[60vh] w-full px-4 pt-6"
    >
      <div className="flex justify-between items-baseline mb-6">
        <h2 className="text-xl font-bold font-sans text-on-surface">Urge Surfing Guide</h2>
        <span className="text-sm font-semibold text-on-surface-variant">Step {currentStepIndex + 1} of {steps.length}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl p-6 relative overflow-hidden flex-1"
        >
          <div className="absolute bottom-0 left-0 h-1 bg-surface-container w-full">
            <motion.div 
              className="h-full bg-[#8d4b00]"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear", duration: 1 }}
            />
          </div>

          <div className="flex items-center gap-2 text-[#8d4b00] font-semibold text-sm mb-4">
            {getIcon(currentStepIndex)}
            <span className="uppercase tracking-wider">Step {currentStepIndex + 1}: {currentStep.title}</span>
          </div>

          <h3 className="text-3xl font-serif font-bold text-on-surface mb-4">
            {currentStep.title}
          </h3>

          <p className="text-lg text-on-surface-variant leading-relaxed">
            {currentStep.instruction}
          </p>
          
          <div className="mt-8 pt-4 border-t border-outline-variant/30 flex justify-end items-center">
            <span className="text-sm font-medium text-on-surface-variant opacity-70">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} remaining
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 text-center flex flex-col items-center">
        <button 
          onClick={onCancel}
          className="text-[#554336] font-semibold hover:text-[#8d4b00] transition-colors mb-4"
        >
          I'm feeling better, Cancel Intervention
        </button>
        
        {currentStepIndex < steps.length - 1 && (
          <button 
            onClick={() => setCurrentStepIndex(i => i + 1)}
            className="px-8 py-3 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold rounded-full transition-all"
          >
            Next Step
          </button>
        )}
        {currentStepIndex === steps.length - 1 && (
          <button 
            onClick={() => onComplete(steps.length)}
            className="px-8 py-3 bg-[#8d4b00] hover:bg-[#b15f00] text-white font-semibold rounded-full transition-all"
          >
            Complete Session
          </button>
        )}
      </div>
    </motion.div>
  );
}
