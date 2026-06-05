'use client';

import { useActionState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { resendConfirmationEmail, type AuthActionResult } from '@/lib/auth/actions';

const initialState: AuthActionResult = {};

type ConfirmEmailPanelProps = {
  email: string;
};

export function ConfirmEmailPanel({ email }: ConfirmEmailPanelProps) {
  const [state, formAction, pending] = useActionState(resendConfirmationEmail, initialState);

  if (!email) return null;

  return (
    <motion.form
      action={formAction}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      <motion.button
        type="submit"
        disabled={pending}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-amber-300 bg-amber-50 text-amber-800 font-semibold hover:bg-amber-100 hover:border-amber-400 transition-all duration-200 disabled:opacity-60"
      >
        {pending ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
        ) : (
          <><Send className="w-4 h-4" /> Resend confirmation email</>
        )}
      </motion.button>

      <AnimatePresence mode="wait">
        {state.success && (
          <motion.p
            key="success"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center justify-center gap-1.5 text-sm text-secondary font-medium"
            role="status"
          >
            <CheckCircle className="w-4 h-4" /> {state.message}
          </motion.p>
        )}
        {state.error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center justify-center gap-1.5 text-sm text-error"
            role="alert"
          >
            <AlertCircle className="w-4 h-4" /> {state.error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.form>
  );
}
