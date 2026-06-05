'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type GoogleSignInButtonProps = {
  label?: string;
  redirectPath?: string;
};

export function GoogleSignInButton({
  label = 'Continue with Google',
  redirectPath = '/auth/callback?next=/onboarding',
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const origin = window.location.origin;

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}${redirectPath}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <motion.button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.98 }}
        style={{
          width: '100%',
          height: '46px',
          border: '1px solid #E2D5C8',
          borderRadius: '10px',
          background: '#fff',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
        className="hover:bg-[#FAFAF9] hover:border-[#D4C9BE] transition-all"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-[#6f5b4e]" />
        ) : (
          <>
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#2c241f' }}>
              {loading ? 'Connecting…' : label}
            </span>
          </>
        )}
      </motion.button>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-600 text-center mt-2"
          role="alert"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}