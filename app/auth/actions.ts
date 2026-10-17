'use server';

import { createAuthActions, createServerClient } from '@insforge/sdk/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ensureUserProfile, type AuthUser } from '@/lib/insforge/profiles';
import { getCampaignDestination } from '@/lib/insforge/campaigns';

type ActionResult = { ok: true; verificationRequired?: boolean; email?: string; redirectTo?: string } | { ok: false; error: string };

const getString = (formData: FormData, key: string) => String(formData.get(key) ?? '').trim();

async function saveProfile(user: AuthUser) {
  const client = createServerClient({ cookies: await cookies() });
  await ensureUserProfile(client, user);
}

export async function signUpAction(formData: FormData): Promise<ActionResult> {
  const name = getString(formData, 'name');
  const email = getString(formData, 'email').toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!name || !email || !password) return { ok: false, error: 'Complete every field to create your account.' };
  if (password.length < 6) return { ok: false, error: 'Your password must be at least 6 characters.' };

  const auth = createAuthActions({ cookies: await cookies() });
  const { data, error } = await auth.signUp({ email, password, name });
  if (error) return { ok: false, error: error.message };
  if (data?.requireEmailVerification) return { ok: true, verificationRequired: true, email };

  if (data?.user) {
    try {
      await saveProfile(data.user);
    } catch (profileError) {
      return { ok: false, error: profileError instanceof Error ? profileError.message : 'Could not save your profile.' };
    }
  }

  const client = createServerClient({ cookies: await cookies() });
  return { ok: true, redirectTo: data?.user ? await getCampaignDestination(client, data.user.id) : '/sign-in' };
}

export async function verifySignupCodeAction(email: string, code: string): Promise<ActionResult> {
  const auth = createAuthActions({ cookies: await cookies() });
  const { data, error } = await auth.verifyEmail({ email, otp: code.trim() });
  if (error || !data?.user) return { ok: false, error: error?.message ?? 'That code could not be verified. Try again.' };

  try {
    await saveProfile(data.user);
  } catch (profileError) {
    return { ok: false, error: profileError instanceof Error ? profileError.message : 'Could not save your profile.' };
  }

  const client = createServerClient({ cookies: await cookies() });
  return { ok: true, redirectTo: await getCampaignDestination(client, data.user.id) };
}

export async function resendSignupCodeAction(email: string): Promise<ActionResult> {
  const client = createServerClient();
  const { error } = await client.auth.resendVerificationEmail({ email });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function signInAction(formData: FormData): Promise<ActionResult> {
  const email = getString(formData, 'email').toLowerCase();
  const password = String(formData.get('password') ?? '');
  if (!email || !password) return { ok: false, error: 'Enter your email and password.' };

  const auth = createAuthActions({ cookies: await cookies() });
  const { data, error } = await auth.signInWithPassword({ email, password });
  if (error || !data?.user) return { ok: false, error: error?.message ?? 'We could not sign you in.' };

  try {
    await saveProfile(data.user);
  } catch (profileError) {
    return { ok: false, error: profileError instanceof Error ? profileError.message : 'Could not save your profile.' };
  }

  return { ok: true, redirectTo: await getCampaignDestination(createServerClient({ cookies: await cookies() }), data.user.id) };
}

const oauthProviders = new Set(['google', 'github', 'microsoft']);

export async function startOAuthAction(provider: string) {
  if (!oauthProviders.has(provider)) throw new Error('This sign-in provider is not available.');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) throw new Error('Set NEXT_PUBLIC_APP_URL before using social sign-in.');

  const cookieStore = await cookies();
  const auth = createAuthActions({ cookies: cookieStore });
  const { data, error } = await auth.signInWithOAuth(provider, {
    redirectTo: new URL('/api/auth/callback', appUrl).toString(),
    skipBrowserRedirect: true,
  });

  if (error || !data?.url || !data.codeVerifier) throw new Error(error?.message ?? 'Could not start social sign-in.');

  cookieStore.set('insforge_code_verifier', data.codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });
  redirect(data.url);
}

export async function signOutAction() {
  const auth = createAuthActions({ cookies: await cookies() });
  await auth.signOut();
  redirect('/sign-in');
}
