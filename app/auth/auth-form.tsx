'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Eye, EyeOff, Github, LoaderCircle, LockKeyhole, Mail, Sparkles } from 'lucide-react';
import { resendSignupCodeAction, signInAction, signUpAction, startOAuthAction, verifySignupCodeAction } from './actions';

type Provider = 'google' | 'github' | 'microsoft';
const providerLabels: Record<Provider, string> = { google: 'Google', github: 'GitHub', microsoft: 'Microsoft' };

export function AuthForm({ mode, providers, initialError }: { mode: 'sign-in' | 'sign-up'; providers: string[]; initialError?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(initialError ? errorMessage(initialError) : '');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationStep, setVerificationStep] = useState(false);
  const [resending, setResending] = useState(false);

  function submitCredentials(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = mode === 'sign-up' ? await signUpAction(formData) : await signInAction(formData);
      if (!result.ok) { setError(result.error); return; }
      if (mode === 'sign-up' && result.verificationRequired && result.email) {
        setVerificationEmail(result.email);
        setVerificationStep(true);
        setMessage('Your account is ready. Enter the 6-digit code we sent to your email.');
        return;
      }
      router.replace('/dashboard');
      router.refresh();
    });
  }

  function verifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const code = String(new FormData(event.currentTarget).get('code') ?? '');
    startTransition(async () => {
      const result = await verifySignupCodeAction(verificationEmail, code);
      if (!result.ok) { setError(result.error); return; }
      router.replace('/dashboard');
      router.refresh();
    });
  }

  function resendCode() {
    setError('');
    setMessage('');
    setResending(true);
    void resendSignupCodeAction(verificationEmail).then((result) => {
      setResending(false);
      if (result.ok) setMessage('A new verification code is on its way.');
      else setError(result.error);
    });
  }

  const enabledProviders = providers.filter((provider): provider is Provider => provider in providerLabels);

  return (
    <main className="auth-layout">
      <section className="auth-intro" aria-label="Social media workspace introduction">
        <a className="auth-brand" href="/" aria-label="Socially home"><span className="brand-mark"><Sparkles size={18} strokeWidth={2.4} /></span><span>socially</span></a>
        <div className="intro-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> YOUR SOCIAL, IN SYNC</span>
          <h1>Make every post<br /><em>count.</em></h1>
          <p>Plan, create, and grow your social presence from one calm, focused workspace.</p>
          <div className="preview-card">
            <div className="preview-topline"><span>WEEKLY OVERVIEW</span><span className="live-dot">● LIVE</span></div>
            <div className="preview-metric"><strong>24.8k</strong><span>↑ 18.6% <small>this week</small></span></div>
            <div className="preview-chart" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
            <div className="preview-days"><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span></div>
          </div>
          <div className="intro-foot"><span className="avatar-stack"><i>A</i><i>M</i><i>J</i><i>+</i></span><span>Join creators growing with intention.</span></div>
        </div>
        <div className="intro-bottom"><span>© 2026 Socially</span><span>Made for the next big thing.</span></div>
      </section>
      <section className="auth-main">
        <div className="auth-topline"><span>Already part of the community?</span><a href={mode === 'sign-in' ? '/sign-up' : '/sign-in'}>{mode === 'sign-in' ? 'Create account' : 'Sign in'} <ArrowRight size={14} /></a></div>
        <div className="auth-card-wrap">
          <div className="auth-heading">
            <span className="auth-mobile-mark"><Sparkles size={17} /></span>
            <span className="eyebrow auth-eyebrow">{verificationStep ? 'ONE LAST STEP' : mode === 'sign-in' ? 'WELCOME BACK' : 'GET STARTED'}</span>
            <h2>{verificationStep ? 'Check your inbox' : mode === 'sign-in' ? 'Sign in to Socially' : 'Create your account'}</h2>
            <p>{verificationStep ? `We sent a verification code to ${verificationEmail}.` : mode === 'sign-in' ? 'Pick up right where your ideas left off.' : 'Bring all your social channels into focus.'}</p>
          </div>
          {error && <div className="form-alert" role="alert">{error}</div>}
          {message && <div className="form-notice" role="status"><Check size={16} />{message}</div>}
          {verificationStep ? (
            <form className="auth-fields" onSubmit={verifyCode}>
              <label htmlFor="code">Verification code</label>
              <input id="code" name="code" className="code-input" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} placeholder="000000" required />
              <button className="primary-button" type="submit" disabled={isPending}>{isPending ? <LoaderCircle className="spin" size={18} /> : <>Verify email <ArrowRight size={17} /></>}</button>
              <button className="text-button" type="button" onClick={resendCode} disabled={resending}>{resending ? 'Sending a new code…' : 'Resend code'}</button>
              <button className="text-button muted-button" type="button" onClick={() => { setVerificationStep(false); setMessage(''); setError(''); }}>Use a different email</button>
            </form>
          ) : <>
            {enabledProviders.length > 0 && <>
              <div className="provider-stack">{enabledProviders.map((provider) => <form action={startOAuthAction.bind(null, provider)} key={provider}><button className="provider-button" type="submit"><ProviderMark provider={provider} /><span>Continue with {providerLabels[provider]}</span><span className="provider-arrow"><ArrowRight size={15} /></span></button></form>)}</div>
              <div className="divider"><span />or continue with email<span /></div>
            </>}
            <form className="auth-fields" onSubmit={submitCredentials}>
              {mode === 'sign-up' && <><label htmlFor="name">Your name</label><div className="field-wrap"><span className="field-icon">Aa</span><input id="name" name="name" type="text" placeholder="How should we call you?" autoComplete="name" required /></div></>}
              <label htmlFor="email">Email address</label>
              <div className="field-wrap"><Mail className="field-icon" size={17} /><input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required /></div>
              <div className="label-row"><label htmlFor="password">Password</label>{mode === 'sign-in' && <span className="secure-note"><LockKeyhole size={12} /> Secure sign-in</span>}</div>
              <div className="field-wrap"><LockKeyhole className="field-icon" size={17} /><input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder={mode === 'sign-up' ? 'At least 6 characters' : 'Enter your password'} autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'} minLength={6} required /><button className="show-password" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
              <button className="primary-button" type="submit" disabled={isPending}>{isPending ? <LoaderCircle className="spin" size={18} /> : <>{mode === 'sign-in' ? 'Sign in' : 'Create account'} <ArrowRight size={17} /></>}</button>
            </form>
            <p className="terms-note">By continuing, you agree to our <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.</p>
          </>}
          <p className="mobile-switch">{mode === 'sign-in' ? 'New to Socially?' : 'Already have an account?'} <a href={mode === 'sign-in' ? '/sign-up' : '/sign-in'}>{mode === 'sign-in' ? 'Create an account' : 'Sign in'}</a></p>
        </div>
        <p className="auth-support">Need a hand? <a href="mailto:support@socially.app">Get in touch</a></p>
      </section>
    </main>
  );
}

function ProviderMark({ provider }: { provider: Provider }) {
  if (provider === 'github') return <Github className="provider-mark" size={18} />;
  if (provider === 'google') return <span className="google-mark" aria-hidden="true">G</span>;
  return <span className="microsoft-mark" aria-hidden="true"><i /><i /><i /><i /></span>;
}

function errorMessage(code: string) {
  if (code === 'oauth_failed') return 'Social sign-in did not complete. Please try again.';
  if (code === 'profile_failed') return 'Your account was authenticated, but we could not save your profile. Please sign in again.';
  return '';
}
