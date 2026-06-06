'use client';

import { useEffect, useState } from 'react';
import { FullPageLink } from '@/components/ui/FullPageLink';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/lib/auth/actions';

export function AuthFooterLinks() {
  const [user, setUser] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(Boolean(data.user)));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(Boolean(session?.user));
    });
    return () => subscription.unsubscribe();
  }, []);

  if (user === null) {
    return (
      <FullPageLink href="/login" className="block text-xs text-white/60 hover:text-white transition-colors">
        Sign In
      </FullPageLink>
    );
  }

  if (user) {
    return (
      <>
        <FullPageLink href="/dashboard" className="block text-xs text-white/60 hover:text-white transition-colors">
          Dashboard
        </FullPageLink>
        <form action={signOut}>
          <button
            type="submit"
            className="block text-xs text-white/60 hover:text-white transition-colors text-left"
          >
            Log Out
          </button>
        </form>
      </>
    );
  }

  return (
    <>
      <FullPageLink href="/register" className="block text-xs text-white/60 hover:text-white transition-colors">
        Create Account
      </FullPageLink>
      <FullPageLink href="/login" className="block text-xs text-white/60 hover:text-white transition-colors">
        Sign In
      </FullPageLink>
    </>
  );
}
