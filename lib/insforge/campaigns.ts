import type { createServerClient } from '@insforge/sdk/ssr';

type InsForgeClient = ReturnType<typeof createServerClient>;

export async function getUserCampaign(client: InsForgeClient, userId: string) {
  const { data, error } = await client.database
    .from('campaign')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Campaign lookup failed: ${error.message}`);
  return data;
}

export async function getCampaignDestination(client: InsForgeClient, userId: string) {
  try {
    return (await getUserCampaign(client, userId)) ? '/dashboard' : '/create-campaign';
  } catch (error) {
    // Do not turn a successful authentication into a sign-in failure if the
    // campaign schema has not been applied yet. Let the setup page explain it.
    console.error('Could not check for an existing campaign:', error);
    return '/create-campaign';
  }
}
