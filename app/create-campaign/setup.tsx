'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { ArrowLeft, ArrowRight, Check, ImagePlus, LoaderCircle, Sparkles, Upload } from 'lucide-react';
import { createCampaignAction } from '@/app/campaign/actions';

const campaignIcons = ['✨', '🚀', '🎯', '🌱', '💡', '⭐'];
const offices = [
  { id: 'creative-studio', title: 'Creative Studio', detail: 'A bright space for bold ideas.', image: '/offices/creative-studio.svg' },
  { id: 'greenhouse', title: 'The Greenhouse', detail: 'Room to grow your audience.', image: '/offices/greenhouse.svg' },
  { id: 'observatory', title: 'The Observatory', detail: 'A clear view of what’s next.', image: '/offices/observatory.svg' },
  { id: 'command-center', title: 'Command Center', detail: 'Everything in sync, at a glance.', image: '/offices/command-center.svg' },
];

export function CampaignSetup({ initialWarning = '' }: { initialWarning?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(campaignIcons[0]);
  const [office, setOffice] = useState('');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState(initialWarning);
  const [pending, startTransition] = useTransition();

  function uploadIcon(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type)) { setError('Choose a PNG, JPG, WEBP, or GIF image.'); return; }
    if (file.size > 1_000_000) { setError('Keep your campaign icon under 1 MB.'); return; }
    setError('');
    const reader = new FileReader();
    reader.onload = () => setIcon(String(reader.result));
    reader.readAsDataURL(file);
  }

  function createCampaign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createCampaignAction(formData);
      if (!result.ok) { setError(result.error); return; }
      router.replace(result.redirectTo);
      router.refresh();
    });
  }

  return (
    <main className="campaign-page">
      <header className="campaign-header">
        <a className="campaign-brand" href="/"><span className="campaign-brand-mark"><Sparkles size={17} /></span> socially</a>
        <span className="campaign-save-note"><span /> Your workspace starts here</span>
      </header>

      <section className="campaign-content">
        <div className="campaign-progress" aria-label={`Step ${step} of 2`}>
          <div className="campaign-step-label"><span className={step === 1 ? 'step-number current' : 'step-number complete'}>{step > 1 ? <Check size={15} /> : '1'}</span><span><b>Campaign details</b><small>Name and identity</small></span></div>
          <span className={`campaign-progress-line ${step === 2 ? 'is-complete' : ''}`} />
          <div className="campaign-step-label"><span className={`step-number ${step === 2 ? 'current' : ''}`}>2</span><span><b>Choose an office</b><small>Your AI agents’ home</small></span></div>
        </div>

        <div className="campaign-heading">
          <span className="campaign-eyebrow">LET’S SET THINGS UP</span>
          <h1>{step === 1 ? 'Create your campaign' : 'Choose your AI Agent Office'}</h1>
          <p>{step === 1 ? 'Give your workspace a name and a little personality.' : 'Pick the space where your AI agents will plan, create, and grow with you.'}</p>
        </div>

        {warning && <p className="campaign-warning" role="status">{warning}</p>}
        {error && <p className="campaign-error" role="alert">{error}</p>}

        {step === 1 ? (
          <div className="campaign-form-card">
            <label className="campaign-label" htmlFor="campaign-name">Campaign name</label>
            <input id="campaign-name" className="campaign-name-input" value={name} onChange={(event) => setName(event.target.value)} maxLength={60} placeholder="e.g. Summer launch" autoFocus />
            <div className="campaign-label-row"><span className="campaign-label">Choose an icon</span><span className="campaign-hint">Pick one or upload your own</span></div>
            <div className="campaign-icon-options">
              {campaignIcons.map((emoji) => <button key={emoji} type="button" className={`campaign-icon-option ${icon === emoji ? 'selected' : ''}`} onClick={() => { setIcon(emoji); setError(''); }} aria-label={`Use ${emoji} as campaign icon`}>{emoji}</button>)}
              <label className={`campaign-upload-option ${icon.startsWith('data:image/') ? 'selected' : ''}`} title="Upload a custom icon">
                <input type="file" accept="image/*" onChange={uploadIcon} />
                {icon.startsWith('data:image/') ? <Image src={icon} alt="Uploaded campaign icon" width={33} height={33} unoptimized /> : <><ImagePlus size={19} /><span>Upload</span></>}
              </label>
            </div>
            <div className="campaign-preview"><span className="campaign-preview-icon">{icon.startsWith('data:image/') ? <Image src={icon} alt="" width={38} height={38} unoptimized /> : icon}</span><span><small>CAMPAIGN PREVIEW</small><b>{name.trim() || 'Your campaign'}</b></span></div>
            <button className="campaign-primary-button" type="button" onClick={() => { if (!name.trim()) { setError('Add a campaign name to continue.'); return; } setError(''); setStep(2); }} disabled={!name.trim()}>Next <ArrowRight size={17} /></button>
          </div>
        ) : (
          <form className="campaign-office-form" onSubmit={createCampaign}>
            <input type="hidden" name="campaignName" value={name.trim()} />
            <input type="hidden" name="campaignIcon" value={icon} />
            <input type="hidden" name="office" value={office} />
            <div className="office-grid">
              {offices.map((item) => (
                <button key={item.id} className={`office-card ${office === item.id ? 'selected' : ''}`} type="button" onClick={() => { setOffice(item.id); setError(''); }} aria-pressed={office === item.id}>
                  <span className="office-image-wrap"><Image src={item.image} alt={`${item.title} AI agent office`} fill sizes="(max-width: 720px) 100vw, 50vw" /><span className="office-check"><Check size={14} /></span></span>
                  <span className="office-copy"><b>{item.title}</b><small>{item.detail}</small></span>
                </button>
              ))}
            </div>
            <div className="campaign-step-actions"><button className="campaign-back-button" type="button" onClick={() => setStep(1)}><ArrowLeft size={16} /> Back</button><button className="campaign-primary-button" type="submit" disabled={!office || pending}>{pending ? <><LoaderCircle className="campaign-spinner" size={17} /> Creating…</> : <>Create Campaign <ArrowRight size={17} /></>}</button></div>
          </form>
        )}
        <p className="campaign-footer-note"><Upload size={13} /> You can update your campaign details at any time.</p>
      </section>
    </main>
  );
}
