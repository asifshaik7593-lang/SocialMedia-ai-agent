'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@insforge/sdk/ssr';
import { getUserCampaign } from '@/lib/insforge/campaigns';

type CreateCampaignResult = { ok: true; redirectTo: string } | { ok: false; error: string };

const offices = new Set(['creative-studio', 'greenhouse', 'observatory', 'command-center']);
const presetIcons = new Set(['✨', '🚀', '🎯', '🌱', '💡', '⭐']);

export async function createCampaignAction(formData: FormData): Promise<CreateCampaignResult> {
  const client = createServerClient({ cookies: await cookies() });
  const { data: auth } = await client.auth.getCurrentUser();
  const user = auth?.user;
  if (!user) return { ok: false, error: 'Your session expired. Sign in and try again.' };

  try {
    if (await getUserCampaign(client, user.id)) return { ok: true, redirectTo: '/dashboard' };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'We could not check your campaign.' };
  }

  const name = String(formData.get('campaignName') ?? '').trim();
  const icon = String(formData.get('campaignIcon') ?? '').trim();
  const office = String(formData.get('office') ?? '').trim();
  if (!name || name.length > 60) return { ok: false, error: 'Enter a campaign name under 60 characters.' };
  const validUpload = /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(icon);
  if ((!presetIcons.has(icon) && !validUpload) || icon.length > 1_500_000) return { ok: false, error: 'Choose an icon or upload a supported image under 1 MB.' };
  if (!offices.has(office)) return { ok: false, error: 'Choose an AI Agent Office to continue.' };

  const { error } = await client.database.from('campaign').insert([{
    user_id: user.id,
    campaign_name: name,
    campaign_icon: icon,
    agent_office: office,
  }]);

  if (error) return { ok: false, error: `We could not save your campaign: ${error.message}` };
  return { ok: true, redirectTo: '/dashboard' };
}
