'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper } from 'lucide-react';
import { DEFAULT_MILESTONE_QUOTE } from '@/lib/chat/constants';

interface MilestoneDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void;
  daysActive?: number;
  submitting?: boolean;
}

export function MilestoneDialog({
  isOpen,
  onClose,
  onSubmit,
  daysActive = 30,
  submitting = false,
}: MilestoneDialogProps) {
  const [content, setContent] = useState(DEFAULT_MILESTONE_QUOTE(daysActive));

  useEffect(() => {
    if (isOpen) {
      setContent(DEFAULT_MILESTONE_QUOTE(daysActive));
    }
  }, [isOpen, daysActive]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="milestone-dialog-title"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-[#2a2a2a] flex justify-between items-center">
              <h2 id="milestone-dialog-title" className="text-lg font-bold text-white flex items-center gap-2">
                <PartyPopper size={20} className="text-[#d97706]" aria-hidden />
                Share a Milestone
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-zinc-500 hover:text-white p-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-zinc-400 mb-4">
                Inspire the community with your progress. Edit the message before sharing — your alias stays hidden in Ghost Mode.
              </p>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-[#2a2a2a] text-white rounded-xl p-4 min-h-[140px] focus:outline-none focus:ring-1 focus:ring-zinc-500 resize-none leading-relaxed"
              />
            </div>
            <div className="p-6 pt-0 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-sm font-medium text-zinc-300 hover:bg-[#2a2a2a] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting || !content.trim()}
                onClick={() => onSubmit(content.trim())}
                className="px-5 py-2 bg-[#d97706] hover:bg-[#b45309] disabled:opacity-50 text-white rounded-full text-sm font-semibold transition-colors"
              >
                {submitting ? 'Sharing…' : 'Share to Community'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
