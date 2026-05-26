/**
 * App Configuration — My Secret Agent
 *
 * Single-app build. Deploy to my-secret-agent.com.
 * Shared Supabase backend with sister apps.
 */

// ─── Tier configuration ───────────────────────────────────────────────────────

export interface TierConfig {
  id: string;
  label: string;
  /** Monthly price string, e.g. "$4.99/mo" */
  price: string;
  /** Optional annual price string, e.g. "$49.99/yr" */
  priceAnnual?: string;
  /** Optional savings note shown next to annual price, e.g. "2 months free" */
  annualSavingsNote?: string;
  /** Optional trial badge text, e.g. "10 days free" */
  trial?: string;
  /** Optional small note shown below trial badge */
  trialNote?: string;
  /** Short mission-count description, e.g. "3–4 missions" */
  missionsLabel: string;
  /** Short cadence description, e.g. "Hourly checks" */
  interval: string;
  /** Feature bullets shown on landing page pricing card */
  featureBullets?: string[];
  /** True for the tier currently in use (shown in in-app pricing panel) */
  current?: boolean;
  /** Marks the "most popular" tier on the landing page */
  highlight?: boolean;
  /** True if the tier is free / signup-only — CTA opens signup modal instead of Stripe */
  isFree?: boolean;
  /** Stripe payment link for monthly subscription. Replace with your real link before going live. */
  stripeLink?: string;
  /** Stripe payment link for annual subscription. Optional. */
  stripeLinkAnnual?: string;
}

export interface LandingConfig {
  /** Bold marketing headline, max 1–2 lines. */
  headline: string;
  /** Word inside the headline that gets the brand color highlight. */
  headlineHighlight?: string;
  /** Two-sentence description below the headline. */
  description: string;
  /** Hero CTA button label. */
  heroCta: string;
  /** Microcopy under the hero CTA button. */
  heroCtaNote: string;
  /** Pricing section heading. */
  pricingHeading: string;
  /** Pricing section sub-line. */
  pricingSubhead: string;
}

export interface ModeConfig {
  /** Display name for headers/branding */
  name: string;
  /** Tagline shown under the wordmark */
  tagline: string;
  /** Production domain (informational) */
  domain: string;
  /** Active mission limit on the free tier */
  missionLimit: number;
  /** Pricing tiers shown in the upgrade panel + landing page */
  tiers: TierConfig[];
  /** Browser tab title */
  documentTitle: string;
  /** Header brand color */
  brandAccent: 'amber';
  /** Marketing landing page copy */
  landing: LandingConfig;
}

// ─── Config ───────────────────────────────────────────────────────────────────

export const MODE: ModeConfig = {
  name: 'My Secret Agent',
  tagline: 'Watching silently in the background.',
  domain: 'my-secret-agent.com',
  missionLimit: 1,
  documentTitle: 'My Secret Agent',
  brandAccent: 'amber',
  landing: {
    headline: 'Your own secret agent. Watching while you live your life.',
    headlineHighlight: 'secret agent',
    description:
      'Set up a mission in seconds — a sale price, the weather, a stock, a website. Your agent watches 24/7 and texts you when something happens. Start free. No card needed.',
    heroCta: 'Start watching — it\'s free',
    heroCtaNote: 'Free forever on 1 mission. Upgrade anytime.',
    pricingHeading: 'Pick your clearance level',
    pricingSubhead: 'Start free. Upgrade when you need more eyes.',
  },
  tiers: [
    {
      id: 'free',
      label: 'Free',
      price: 'Free',
      missionsLabel: '1 active mission',
      interval: 'Daily checks',
      isFree: true,
      featureBullets: [
        '1 active mission',
        'Sentence form only',
        'Push notifications',
        'Ad supported',
        'Free forever',
      ],
    },
    {
      id: 'agent',
      label: 'Agent',
      price: '$4.99/mo',
      missionsLabel: 'Up to 10 missions',
      interval: 'Hourly checks',
      highlight: true,
      featureBullets: [
        'Up to 10 missions',
        'Unlocks The Van dashboard',
        'Hourly checks',
        'Push notifications',
        'No ads',
        '$4.99/mo',
      ],
      stripeLink: 'https://buy.stripe.com/REPLACE_WITH_AGENT_MONTHLY_LINK',
    },
    {
      id: 'network',
      label: 'Network',
      price: '$14.99/mo',
      missionsLabel: 'Unlimited missions',
      interval: 'Faster checks',
      featureBullets: [
        'Unlimited missions',
        'Everything in Agent',
        'Faster checks',
        'Priority alerts',
        'All 10 mission types',
        '$14.99/mo',
      ],
      stripeLink: 'https://buy.stripe.com/REPLACE_WITH_NETWORK_MONTHLY_LINK',
    },
  ],
};

/** Returns true when the user has hit their tier's mission limit */
export function atMissionLimit(activeMissionCount: number): boolean {
  return activeMissionCount >= MODE.missionLimit;
}
