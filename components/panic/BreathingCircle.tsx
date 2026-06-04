'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type BreathingPhase = 'inhale' | 'hold' | 'exhale';

export function BreathingCircle({ onComplete, urgeStartTime }: { onComplete: () => void, urgeStartTime: number }) {
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [cycleCount, setCycleCount] = useState(0);
  const [elapsed, setElapsed] = useState('00:00');

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.floor((Date.now() - urgeStartTime) / 1000);
      const m = Math.floor(diff / 60).toString().padStart(2, '0');
      const s = (diff % 60).toString().padStart(2, '0');
      setElapsed(`${m}:${s}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [urgeStartTime]);

  useEffect(() => {
    if (cycleCount >= 2) {
      onComplete();
      return;
    }

    let timeout: NodeJS.Timeout;

    if (phase === 'inhale') {
      timeout = setTimeout(() => setPhase('hold'), 4000);
    } else if (phase === 'hold') {
      timeout = setTimeout(() => setPhase('exhale'), 7000);
    } else if (phase === 'exhale') {
      timeout = setTimeout(() => {
        setPhase('inhale');
        setCycleCount(c => c + 1);
      }, 8000);
    }

    return () => clearTimeout(timeout);
  }, [phase, cycleCount, onComplete]);

  const circleVariants = {
    inhale: { scale: 1.5, transition: { duration: 4, ease: 'easeInOut' as const } },
    hold: { scale: 1.5, transition: { duration: 7, ease: 'linear' as const } },
    exhale: { scale: 1, transition: { duration: 8, ease: 'easeInOut' as const } },
  };

  const textMap = {
    inhale: 'Inhale',
    hold: 'Hold',
    exhale: 'Exhale'
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] relative w-full px-4"
    >
      <div className="absolute top-0 left-0 w-full flex justify-between items-center px-4 pt-4">
        <div className="bg-[#ffdad6] text-[#ba1a1a] px-3 py-1 rounded-full flex items-center gap-2 text-sm font-semibold">
          <div className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-pulse" />
          Urge Active
        </div>
        <div className="text-xl font-bold text-on-surface-variant font-sans">
          {elapsed}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center w-full relative min-h-[300px]">
        <motion.div 
          variants={circleVariants}
          animate={phase}
          className="absolute w-48 h-48 rounded-full bg-[#8d4b00]/5 mix-blend-multiply"
        />
        <motion.div 
          variants={circleVariants}
          animate={phase}
          className="absolute w-40 h-40 rounded-full bg-[#8d4b00]/10"
        />
        <div className="relative w-32 h-32 rounded-full bg-surface-container-lowest shadow-lg flex items-center justify-center z-10 border border-[#887364]/20">
          <AnimatePresence mode="wait">
            <motion.span
              key={phase}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-2xl font-serif font-bold text-[#8d4b00]"
            >
              {textMap[phase]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <div className="mb-8 mt-4 text-center flex flex-col items-center gap-4">
        <h2 className="text-4xl font-serif font-bold text-on-surface">
          Breathe with us.
        </h2>
        
        <div className="flex gap-2 justify-center">
          <div className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${phase === 'inhale' ? 'bg-[#8d4b00] text-white' : 'bg-surface-container text-on-surface-variant'}`}>
            In: 4s
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${phase === 'hold' ? 'bg-[#8d4b00] text-white' : 'bg-surface-container text-on-surface-variant'}`}>
            Hold: 7s
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${phase === 'exhale' ? 'bg-[#8d4b00] text-white' : 'bg-surface-container text-on-surface-variant'}`}>
            Out: 8s
          </div>
        </div>
      </div>
    </motion.div>
  );
}
