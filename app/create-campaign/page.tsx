import { redirect } from 'next/navigation';
import { createInsforgeServerClient } from '@/lib/insforge/server';
import { getUserCampaign } from '@/lib/insforge/campaigns';
import { CampaignSetup } from './setup';

export default async function CreateCampaignPage() {
  const client = await createInsforgeServerClient();
  const { data } = await client.auth.getCurrentUser();
  const user = data?.user;
  if (!user) redirect('/sign-in');
  let campaignLookupWarning = '';
  try {
    if (await getUserCampaign(client, user.id)) redirect('/dashboard');
  } catch (error) {
    console.error('Could not check for an existing campaign:', error);
    campaignLookupWarning = 'Campaign setup needs a database update before it can be saved. Apply the campaign migration, then refresh this page.';
  }

  return <CampaignSetup initialWarning={campaignLookupWarning} />;
}
