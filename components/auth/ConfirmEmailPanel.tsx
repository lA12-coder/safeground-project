'use client';

import { useActionState } from 'react';
import { resendConfirmationEmail, type AuthActionResult } from '@/lib/auth/actions';

const initialState: AuthActionResult = {};

type ConfirmEmailPanelProps = {
  email: string;
};

export function ConfirmEmailPanel({ email }: ConfirmEmailPanelProps) {
  const [state, formAction, pending] = useActionState(resendConfirmationEmail, initialState);

  if (!email) return null;

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="email" value={email} />
      <button
        type="submit"
        disabled={pending}
        className="w-full btn-secondary py-3 disabled:opacity-60"
      >
        {pending ? 'Sending…' : 'Resend confirmation email'}
      </button>
      {state.success && (
        <p className="text-sm text-secondary text-center" role="status">
          {state.message}
        </p>
      )}
      {state.error && (
        <p className="text-sm text-error text-center" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
