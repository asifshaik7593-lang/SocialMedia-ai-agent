import { AuthPageContent } from '@/app/auth/page-content';

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return <AuthPageContent mode="sign-in" initialError={params.error} />;
}
