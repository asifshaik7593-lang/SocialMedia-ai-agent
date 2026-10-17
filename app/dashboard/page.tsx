import { redirect } from 'next/navigation';
import { ArrowUpRight, CalendarDays, ChartNoAxesCombined, CircleUserRound, Clock3, LogOut, Sparkles, WandSparkles } from 'lucide-react';
import { signOutAction } from '@/app/auth/actions';
import { createInsforgeServerClient } from '@/lib/insforge/server';
import { ensureUserProfile } from '@/lib/insforge/profiles';
import { getUserCampaign } from '@/lib/insforge/campaigns';

export default async function DashboardPage() {
  const client = await createInsforgeServerClient();
  const { data } = await client.auth.getCurrentUser();
  const user = data?.user;
  if (!user) redirect('/sign-in');
  if (!(await getUserCampaign(client, user.id))) redirect('/create-campaign');

  await ensureUserProfile(client, user);
  const { data: profile } = await client.database.from('profiles').select('email, name, avatar_url, provider, created_at').eq('id', user.id).maybeSingle();
  const displayName = profile?.name || user.profile?.name || user.email.split('@')[0];

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <a className="auth-brand dashboard-brand" href="/"><span className="brand-mark"><Sparkles size={17} /></span><span>socially</span></a>
        <div className="sidebar-label">WORKSPACE</div>
        <a className="side-item active" href="/dashboard"><ChartNoAxesCombined size={17} /> Overview</a>
        <a className="side-item" href="#calendar"><CalendarDays size={17} /> Content calendar <span className="side-soon">SOON</span></a>
        <a className="side-item" href="#create"><WandSparkles size={17} /> AI studio <span className="side-soon">SOON</span></a>
        <div className="sidebar-bottom"><div className="sidebar-plan"><Sparkles size={15} /><span><b>Your next chapter</b><small>Starts with one good post.</small></span></div><div className="sidebar-user"><span className="user-avatar">{displayName.slice(0, 1).toUpperCase()}</span><span><b>{displayName}</b><small>{profile?.email || user.email}</small></span><form action={signOutAction}><button className="signout-button" type="submit"><LogOut size={16} /><span>Log out</span></button></form></div></div>
      </aside>
      <section className="dashboard-main">
        <header className="dashboard-topbar"><div><span className="eyebrow auth-eyebrow">YOUR WORKSPACE</span><span className="workspace-status"><i /> ALL SYSTEMS READY</span></div><div className="top-user"><span>{profile?.email || user.email}</span><span className="user-avatar small-avatar">{displayName.slice(0, 1).toUpperCase()}</span></div></header>
        <div className="dashboard-content">
          <div className="welcome-row"><div><p className="dashboard-date">YOUR SOCIAL MEDIA, IN ONE PLACE</p><h1>Good to have you here, {displayName} <span>✦</span></h1><p className="welcome-subtitle">Your account is ready. Let’s make something people want to stop scrolling for.</p></div><div className="profile-status"><CircleUserRound size={19} /><span><b>Profile saved</b><small>{profile?.provider ? `Signed in with ${profile.provider}` : 'Connected to your account'}</small></span></div></div>
          <div className="dashboard-welcome-card"><div className="welcome-card-orb" /><div className="welcome-card-copy"><span className="eyebrow">A GOOD PLACE TO START</span><h2>Your next great post<br />starts right here.</h2><p>Connect a social channel and we’ll help you plan, write, and understand what’s next.</p><button className="primary-button" type="button" disabled>Connect a channel <ArrowUpRight size={16} /></button><small className="coming-soon"><Clock3 size={13} /> Channel connections are coming soon</small></div><div className="welcome-card-art"><div className="art-ring ring-one" /><div className="art-ring ring-two" /><div className="art-center"><Sparkles size={31} /></div><span className="art-chip chip-one">✦ Your voice</span><span className="art-chip chip-two">✧ Your ideas</span><span className="art-chip chip-three">↗ Your growth</span></div></div>
          <div className="dashboard-section-heading"><div><span className="eyebrow auth-eyebrow">YOUR CREATOR TOOLKIT</span><h2>Everything starts with a spark.</h2></div><span className="section-note">More tools are on the way</span></div>
          <div className="tool-grid"><article className="tool-card"><span className="tool-icon lavender"><WandSparkles size={18} /></span><div><b>AI Studio</b><small>Draft on-brand captions and turn a thought into a post.</small></div><span className="coming-pill">COMING SOON</span></article><article className="tool-card"><span className="tool-icon peach"><CalendarDays size={18} /></span><div><b>Content Calendar</b><small>Bring your ideas together and find your rhythm.</small></div><span className="coming-pill">COMING SOON</span></article><article className="tool-card"><span className="tool-icon mint"><ChartNoAxesCombined size={18} /></span><div><b>Insights</b><small>See what your audience loves and make more of it.</small></div><span className="coming-pill">COMING SOON</span></article></div>
          <footer className="dashboard-footer"><span>© 2026 Socially</span><span>Signed in as {user.email}</span></footer>
        </div>
      </section>
    </main>
  );
}
