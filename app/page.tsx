import Link from 'next/link';
import { ArrowRight, CalendarDays, ChartNoAxesCombined, Sparkles, WandSparkles } from 'lucide-react';
import { createInsforgeServerClient } from '@/lib/insforge/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const client = await createInsforgeServerClient();
  const { data } = await client.auth.getCurrentUser();
  if (data?.user) redirect('/dashboard');

  return (
    <main className="landing-page">
      <header className="landing-nav">
        <Link className="auth-brand landing-brand" href="/"><span className="brand-mark"><Sparkles size={18} /></span><span>socially</span></Link>
        <nav><Link href="#features">Features</Link><Link href="/sign-in">Sign in</Link><Link className="nav-cta" href="/sign-up">Get started <ArrowRight size={15} /></Link></nav>
      </header>
      <section className="landing-hero">
        <div className="landing-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> THE SOCIAL WORKSPACE FOR WHAT'S NEXT</span>
          <h1>Your ideas deserve<br /><em>a bigger audience.</em></h1>
          <p>Turn your social channels into a growth engine. Plan your content, create with AI, and see what’s working — all in one place.</p>
          <div className="landing-actions"><Link className="primary-button landing-primary" href="/sign-up">Start creating for free <ArrowRight size={17} /></Link><Link className="landing-secondary" href="/sign-in">I already have an account</Link></div>
          <div className="landing-proof"><span className="avatar-stack"><i>A</i><i>M</i><i>J</i><i>+</i></span><span>One workspace. More room to grow.</span></div>
        </div>
        <div className="landing-visual" aria-label="Social media planning dashboard preview">
          <div className="visual-glow" />
          <div className="mock-window">
            <div className="mock-titlebar"><span className="mock-brand"><span className="brand-mark"><Sparkles size={12} /></span> socially</span><div className="mock-dots"><i /><i /><i /></div></div>
            <div className="mock-content">
              <div className="mock-greeting"><span>MONDAY, OCTOBER 12</span><strong>Good morning, Alex ✨</strong><small>Here’s what’s happening with your socials.</small></div>
              <div className="mock-stats"><div><span><ChartNoAxesCombined size={13} /> TOTAL REACH</span><b>24.8k <i>+18.6%</i></b></div><div><span><WandSparkles size={13} /> POSTS THIS WEEK</span><b>12 <i>on track</i></b></div></div>
              <div className="mock-schedule-head"><strong><CalendarDays size={14} /> Upcoming posts</strong><span>View calendar <ArrowRight size={12} /></span></div>
              <div className="mock-post"><span className="post-icon post-purple">in</span><div><b>Small steps, big momentum.</b><small>LinkedIn · Today at 10:30 AM</small></div><span className="post-state">Scheduled</span></div>
              <div className="mock-post"><span className="post-icon post-orange">◉</span><div><b>A little behind the scenes ✨</b><small>Instagram · Today at 2:00 PM</small></div><span className="post-state">Scheduled</span></div>
            </div>
          </div>
          <div className="floating-note"><span className="sparkle-small"><Sparkles size={14} /></span><span><b>AI caption ready</b><small>Made for your voice</small></span><CheckBadge /></div>
        </div>
      </section>
      <section className="landing-features" id="features"><span>LESS BUSYWORK, MORE MOMENTUM</span><div><article><WandSparkles size={19} /><b>Create with your AI copilot</b><small>On-brand ideas and drafts, whenever inspiration strikes.</small></article><article><CalendarDays size={19} /><b>Keep every channel in sync</b><small>Plan a week of content without the tab-juggling.</small></article><article><ChartNoAxesCombined size={19} /><b>Grow with a clear signal</b><small>Know what resonates and what to make next.</small></article></div></section>
      <footer className="landing-footer"><span>© 2026 Socially</span><span>Make good things. Share them well.</span></footer>
    </main>
  );
}

function CheckBadge() {
  return <span className="check-badge">✓</span>;
}
