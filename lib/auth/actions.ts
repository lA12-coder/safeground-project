'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getPostAuthRedirect } from '@/lib/auth/onboarding';
import { getAuthCallbackUrl } from '@/lib/auth/site-url';

export type AuthActionResult = {
  error?: string;
  success?: boolean;
  message?: string;
};

function isEmailNotConfirmedError(error: { message?: string; code?: string }): boolean {
  const msg = (error.message ?? '').toLowerCase();
  return (
    error.code === 'email_not_confirmed' ||
    msg.includes('email not confirmed') ||
    msg.includes('not confirmed')
  );
}

export async function signInWithEmail(
  _prev: AuthActionResult,
  formData: FormData
): Promise<AuthActionResult> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const redirectTo = String(formData.get('redirectTo') ?? '').trim() || null;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (isEmailNotConfirmedError(error)) {
      return { error: 'Please confirm your email before signing in.' };
    }
    return { error: 'Invalid email or password. Please try again.' };
  }

  redirect(getPostAuthRedirect(data.user, redirectTo));
}

export async function signUpWithEmail(
  _prev: AuthActionResult,
  formData: FormData
): Promise<AuthActionResult> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const alias = String(formData.get('alias') ?? '').trim();

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        alias: alias || undefined,
        display_name: alias || undefined,
        onboarding_complete: false,
      },
      emailRedirectTo: getAuthCallbackUrl('/onboarding'),
    },
  });

  if (error) {
    return { error: 'Could not create your account. Please try again.' };
  }

  await supabase.auth.signOut();

  const needsEmailConfirmation = Boolean(data.user && !data.session);

  if (needsEmailConfirmation) {
    const params = new URLSearchParams({
      confirmEmail: '1',
      email,
      redirectTo: '/onboarding',
    });
    redirect(`/login?${params.toString()}`);
  }

  redirect('/login?registered=1&redirectTo=/onboarding');
}

export async function resendConfirmationEmail(
  _prev: AuthActionResult,
  formData: FormData
): Promise<AuthActionResult> {
  const email = String(formData.get('email') ?? '').trim();

  if (!email) {
    return { error: 'Email is required.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: getAuthCallbackUrl('/onboarding'),
    },
  });

  if (error) {
    return { error: 'Could not send email. Wait a moment and try again.' };
  }

  return {
    success: true,
    message: 'Sent. Check your inbox.',
  };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function completeOnboarding(
  _prev: AuthActionResult,
  formData: FormData
): Promise<AuthActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in to complete onboarding.' };
  }

  const triggers = formData.getAll('triggers').map(String);
  const language = String(formData.get('language') ?? 'en');
  const supportMode = String(formData.get('support_mode') ?? 'secular');
  const guardianOptIn = formData.get('guardian_opt_in') === 'true';
  const recoveryGoal = String(formData.get('recovery_goal') ?? '');

  const { error } = await supabase.auth.updateUser({
    data: {
      language,
      support_mode: supportMode,
      guardian_opt_in: guardianOptIn,
      recovery_goal: recoveryGoal,
      triggers,
      onboarding_complete: true,
    },
  });

  if (error) {
    return { error: error.message };
  }

  await supabase.from('profiles').upsert({
    id: user.id,
    alias: user.user_metadata?.alias ?? user.user_metadata?.display_name ?? 'Anonymous',
    language,
    support_mode: supportMode,
    guardian_opt_in: guardianOptIn,
    recovery_goal: recoveryGoal,
    triggers,
    updated_at: new Date().toISOString(),
  });

  await supabase.from('streaks').upsert({ user_id: user.id });

  redirect('/dashboard');
}
