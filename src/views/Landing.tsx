/**
 * Landing / Marketing page shown to UNAUTHENTICATED users only.
 *
 * Authenticated users skip this page — they go straight into the app
 * (SecretAgent or CommandCenter) per appMode.defaultView.
 *
 * The Skyland Reach auth modals open as overlays on top of this page.
 */

import { useState } from 'react';
import { Check, Lock, Shield, ExternalLink } from 'lucide-react';
import AuthModal from '../components/AuthModal';
import { MODE, type TierConfig } from '../lib/appMode';

type AuthRequest = { open: boolean; mode: 'signin' | 'signup' };

export default function Landing() {
  const [auth, setAuth] = useState<AuthRequest>({ open: false, mode: 'signin' });
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  const hasAnnual = MODE.tiers.some((t) => t.priceAnnual);

  const accentText = 'text-amber-400';
  const accentBg = 'bg-amber-500/10';
  const accentBorder = 'border-amber-500/30';

  function openSignUp() {
    setAuth({ open: true, mode: 'signup' });
  }
  function openSignIn() {
    setAuth({ open: true, mode: 'signin' });
  }
  function closeAuth() {
    setAuth({ open: false, mode: auth.mode });
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#f5f0e8] font-['DM_Sans',sans-serif] flex flex-col">

      {/* ─── Top bar ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-[#2a2a2a] bg-[#1a1a1a]/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="pulse-dot" />
            <span className="font-semibold text-sm tracking-[0.25em] uppercase text-[#f5f0e8]">
              {MODE.name}
            </span>
          </div>
          <button
            onClick={openSignIn}
            className="font-mono text-[12px] uppercase tracking-widest text-[#a0a0a0] hover:text-white transition-colors px-3 py-1.5 rounded-sm border border-transparent hover:border-[#3a3a3a]"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* ─── Hero ────────────────────────────────────────────────────────────── */}
      <section className="border-b border-[#2a2a2a] relative overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row items-center gap-12">

          {/* Hero image */}
          <div className="flex-shrink-0 w-64 md:w-80 lg:w-96">
            <img
              src="/agent-hero.png"
              alt="Your secret agent"
              className="w-full h-auto rounded-2xl shadow-2xl shadow-black/60"
            />
          </div>

          {/* Hero copy */}
          <div className="flex-1 text-center md:text-left">
            <div className={`inline-flex items-center gap-2 ${accentBg} border ${accentBorder} rounded-full px-3 py-1 mb-6`}>
              <Shield size={11} className={accentText} />
              <span className={`font-mono text-[11px] tracking-widest uppercase ${accentText}`}>
                {MODE.tagline}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight mb-6">
              <Headline text={MODE.landing.headline} highlight={MODE.landing.headlineHighlight} accent={accentText} />
            </h1>

            <p className="text-lg text-[#c0c0c0] leading-relaxed max-w-2xl mb-10">
              {MODE.landing.description}
            </p>

            <div className="flex flex-col items-center md:items-start gap-3">
              <button onClick={openSignUp} className="activate-btn text-base px-8 py-3.5">
                {MODE.landing.heroCta}
              </button>
              <p className="font-mono text-[12px] text-[#888] tracking-wide">
                {MODE.landing.heroCtaNote}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ─── Pricing ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-[#2a2a2a]">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <p className={`font-mono text-[11px] tracking-[0.3em] uppercase ${accentText} mb-3`}>
              — {MODE.landing.pricingHeading} —
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              Simple pricing. Real value.
            </h2>
            <p className="text-[#a0a0a0] max-w-xl mx-auto leading-relaxed">
              {MODE.landing.pricingSubhead}
            </p>

            {/* Monthly / Annual toggle */}
            {hasAnnual && (
              <div className="inline-flex mt-8 bg-[#1f1f1f] border border-[#333] rounded-full p-1">
                <button
                  onClick={() => setBilling('monthly')}
                  className={`px-5 py-1.5 rounded-full font-mono text-[12px] tracking-widest uppercase transition-colors ${
                    billing === 'monthly'
                      ? `${accentBg} ${accentText}`
                      : 'text-[#888] hover:text-[#c0c0c0]'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBilling('annual')}
                  className={`px-5 py-1.5 rounded-full font-mono text-[12px] tracking-widest uppercase transition-colors ${
                    billing === 'annual'
                      ? `${accentBg} ${accentText}`
                      : 'text-[#888] hover:text-[#c0c0c0]'
                  }`}
                >
                  Annual
                </button>
              </div>
            )}
          </div>

          {/* Pricing grid */}
          <div className={`grid gap-5 ${MODE.tiers.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : 'md:grid-cols-3'}`}>
            {MODE.tiers.map((tier) => (
              <PricingCard
                key={tier.id}
                tier={tier}
                billing={billing}
                onFreeCta={openSignUp}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-[#2a2a2a] bg-[#141414]">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="font-mono text-[12px] text-[#888]">
            A <span className="text-[#c0c0c0]">Skyland Reach</span> product ·{' '}
            <a
              href="mailto:support@skylandreach.com"
              className="hover:text-amber-400 transition-colors"
            >
              support@skylandreach.com
            </a>
          </p>
          <p className="font-mono text-[12px] text-[#888]">
            Cancel at any time · Your data is yours · Never sold
          </p>
        </div>
      </footer>

      {/* ─── Auth Modal Overlay ──────────────────────────────────────────────── */}
      {auth.open && (
        <AuthModal
          initialMode={auth.mode}
          onClose={closeAuth}
          onSuccess={closeAuth}
        />
      )}
    </div>
  );
}

// ─── Headline component (highlights one phrase in brand color) ────────────────

function Headline({
  text,
  highlight,
  accent,
}: {
  text: string;
  highlight?: string;
  accent: string;
}) {
  if (!highlight || !text.includes(highlight)) {
    return <>{text}</>;
  }
  const parts = text.split(highlight);
  return (
    <>
      {parts[0]}
      <span className={accent}>{highlight}</span>
      {parts[1]}
    </>
  );
}

// ─── Pricing card ─────────────────────────────────────────────────────────────

function PricingCard({
  tier,
  billing,
  onFreeCta,
}: {
  tier: TierConfig;
  billing: 'monthly' | 'annual';
  onFreeCta: () => void;
}) {
  const accentText = 'text-amber-400';
  const accentBg = 'bg-amber-500/10';
  const accentBorder = 'border-amber-500/40';

  const isAnnual = billing === 'annual' && !!tier.priceAnnual;
  const displayPrice = isAnnual ? tier.priceAnnual! : tier.price;
  const stripeUrl = isAnnual && tier.stripeLinkAnnual ? tier.stripeLinkAnnual : tier.stripeLink;

  return (
    <div
      className={`relative bg-[#1f1f1f] rounded-xl p-6 flex flex-col ${
        tier.highlight ? `border-2 ${accentBorder} shadow-2xl` : 'border border-[#333]'
      }`}
    >
      {tier.highlight && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${accentBg} ${accentText} border ${accentBorder} rounded-full px-3 py-0.5 font-mono text-[10px] tracking-widest uppercase`}>
          Most Popular
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[12px] tracking-[0.3em] uppercase text-[#c8c0b0]">
          {tier.label}
        </span>
        {tier.trial && (
          <span className="bg-green-500/15 border border-green-500/30 rounded-sm px-2 py-0.5 font-mono text-[10px] text-green-400 tracking-widest uppercase">
            {tier.trial}
          </span>
        )}
      </div>

      <div className="mb-2">
        <p className="text-3xl font-semibold text-[#f5f0e8]">
          {tier.trial && billing === 'monthly' && (
            <span className="text-[#888] text-base font-normal">then </span>
          )}
          {displayPrice}
        </p>
        {isAnnual && tier.annualSavingsNote && (
          <p className={`font-mono text-[11px] mt-0.5 ${accentText}`}>
            {tier.annualSavingsNote}
          </p>
        )}
      </div>

      <p className="font-mono text-[12px] text-[#a0a0a0] mb-1">{tier.missionsLabel}</p>
      <p className="font-mono text-[12px] text-[#888] mb-4">{tier.interval}</p>

      {/* Feature bullets */}
      {tier.featureBullets && tier.featureBullets.length > 0 && (
        <ul className="flex flex-col gap-2.5 mb-6 mt-2">
          {tier.featureBullets.map((feat) => (
            <li key={feat} className="flex items-start gap-2.5 text-sm text-[#d0d0d0] leading-snug">
              <Check size={14} className={`flex-shrink-0 mt-0.5 ${accentText}`} />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      )}

      {/* CTA */}
      <div className="mt-auto">
        {tier.isFree || !stripeUrl ? (
          <button onClick={onFreeCta} className="activate-btn w-full">
            {tier.trial ? `Start ${tier.trial.toLowerCase()}` : 'Sign up free'}
          </button>
        ) : (
          <>
            <a
              href={stripeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="activate-btn w-full inline-flex items-center justify-center gap-2"
            >
              Subscribe — {displayPrice}
              <ExternalLink size={13} />
            </a>
            <p className="text-center font-mono text-[10px] text-[#888] mt-2 flex items-center justify-center gap-1.5">
              <Lock size={9} />
              Secure checkout via Stripe · Cancel anytime
            </p>
          </>
        )}
      </div>
    </div>
  );
}
