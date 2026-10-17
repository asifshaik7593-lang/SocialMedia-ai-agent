import { createAuthActions, createServerClient } from '@insforge/sdk/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { ensureUserProfile, type AuthUser } from '@/lib/insforge/profiles';
import { getCampaignDestination } from '@/lib/insforge/campaigns';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('insforge_code');
  const verifier = request.cookies.get('insforge_code_verifier')?.value;
  const failureUrl = new URL('/sign-in?error=oauth_failed', request.url);

  if (!code || !verifier || request.nextUrl.searchParams.has('error')) {
    return NextResponse.redirect(failureUrl);
  }

  const response = NextResponse.redirect(new URL('/dashboard', request.url));
  const auth = createAuthActions({ requestCookies: request.cookies, responseCookies: response.cookies });
  const { data, error } = await auth.exchangeOAuthCode(code, verifier);

  if (error || !data?.user) return NextResponse.redirect(failureUrl);

  const accessToken = response.cookies.get('insforge_access_token')?.value;
  if (!accessToken) return NextResponse.redirect(failureUrl);

  try {
    const client = createServerClient({ accessToken });
    await ensureUserProfile(client, data.user as AuthUser);
    response.headers.set('Location', new URL(await getCampaignDestination(client, data.user.id), request.url).toString());
  } catch {
    return NextResponse.redirect(new URL('/sign-in?error=profile_failed', request.url));
  }

  response.cookies.delete('insforge_code_verifier');
  return response;
}
