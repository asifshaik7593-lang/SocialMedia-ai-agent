import type { createServerClient } from '@insforge/sdk/ssr';

type InsForgeClient = ReturnType<typeof createServerClient>;

export type AuthUser = {
  id: string;
  email: string;
  providers?: string[];
  profile?: { name?: string; avatar_url?: string } | null;
  metadata?: Record<string, unknown> | null;
};

export async function ensureUserProfile(client: InsForgeClient, user: AuthUser) {
  const { data: profile, error: readError } = await client.database
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (readError) throw new Error('We could not load your account profile. Please try again.');
  if (profile) return;

  const metadataName = user.metadata?.name;
  const name = user.profile?.name ?? (typeof metadataName === 'string' ? metadataName : null);
  const provider = user.providers?.find((item) => item !== 'email') ?? 'email';
  const { error: insertError } = await client.database.from('profiles').insert([
    {
      id: user.id,
      email: user.email,
      name,
      avatar_url: user.profile?.avatar_url ?? null,
      provider,
    },
  ]);

  if (insertError) throw new Error('We could not save your account profile. Please try again.');
}

