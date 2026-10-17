import { createInsforgeServerClient } from '@/lib/insforge/server';
import { redirect } from 'next/navigation';
import { AuthForm } from './auth-form';
import { getCampaignDestination } from '@/lib/insforge/campaigns';

export async function AuthPageContent({ mode, initialError }: { mode: 'sign-in' | 'sign-up'; initialError?: string }) {
  const client = await createInsforgeServerClient();
  const [{ data: authConfig }, { data: session }] = await Promise.all([
    client.auth.getPublicAuthConfig(),
    client.auth.getCurrentUser(),
  ]);
  if (session?.user && !initialError) redirect(await getCampaignDestination(client, session.user.id));
  return <AuthForm mode={mode} providers={authConfig?.oAuthProviders ?? []} initialError={initialError} />;
}
