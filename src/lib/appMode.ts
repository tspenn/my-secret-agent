/**
 * App Configuration — My Secret Agent
 *
 * Standalone personal monitoring app at my-secret-agent.com.
 * Shares Supabase backend with sister apps (GIA, FRIDAY, GoShop, etc.)
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
  /** Stripe payment link for monthly subscription. Replace with real link before going live. */
  stripeLink?: string;
  /** Stripe payment link for annual subscription. */
  stripeLinkAnnual?: string;
}

export interface LandingConfig {
  headline: string;
  headlineHighlight?: string;
  description: string;
  heroCta: string;
  heroCtaNote: string;
  pricingHeading: string;
  pricingSubhead: string;
}

export interface ModeConfig {
  name: string;
  tagline: string;
  domain: string;
  /** Which view is the default landing screen after sign-in */
  defaultView: 'agent' | 'command';
  /** Active mission limit on the free/entry tier */
  missionLimit: number;
  tiers: TierConfig[];
  documentTitle: string;
  brandAccent: 'amber' | 'emerald';
  landing: LandingConfig;
}

// ─── Config ───────────────────────────────────────────────────────────────────

export const MODE: ModeConfig = {
  name: 'My Secret Agent',
  tagline: 'Watching silently in the background.',
  domain: 'my-secret-agent.com',
  defaultView: 'agent',
  missionLimit: 1,
  documentTitle: 'My Secret Agent',
  brandAccent: 'amber',
  landing: {
    headline: 'A silent watchman for the things you can\'t watch yourself.',
    headlineHighlight: 'silent watchman',
    description:
      'Set up missions in plain English — weather, sale prices, stock thresholds, bank balances. Your secret agent watches in the background and pings you the moment something changes.',
    heroCta: 'Start Watching — It\'s Free',
    heroCtaNote: 'Free forever on 1 mission. Upgrade anytime.',
    pricingHeading: 'Pick Your Clearance Level',
    pricingSubhead: 'Start free. Upgrade when you need more eyes.',
  },
  tiers: [
    {
      id: 'free',
      label: 'Free',
      price: 'Free',
      missionsLabel: '1 active mission',
      interval: 'Daily checks',
      current: true,
      isFree: true,
      featureBullets: [
        '1 active mission',
        'Daily checks',
        'Push notifications (Ping)',
        'Free forever — no card',
      ],
    },
    {
      id: 'agent',
      label: 'Agent',
      price: '$4.99/mo',
      priceAnnual: '$49.99/yr',
      annualSavingsNote: '2 months free',
      missionsLabel: 'Up to 10 missions',
      interval: 'Hourly checks',
      highlight: true,
      featureBullets: [
        'Up to 10 active missions',
        'Hourly checks',
        'Push notifications (Ping)',
        'All 10 mission types',
      ],
      stripeLink: 'https://buy.stripe.com/REPLACE_WITH_AGENT_MONTHLY_LINK',
      stripeLinkAnnual: 'https://buy.stripe.com/REPLACE_WITH_AGENT_ANNUAL_LINK',
    },
    {
      id: 'network',
      label: 'Network',
      price: '$14.99/mo',
      priceAnnual: '$149.99/yr',
      annualSavingsNote: '2 months free',
      missionsLabel: 'Unlimited missions',
      interval: 'Faster checks',
      featureBullets: [
        'Unlimited missions',
        'Faster checks',
        'Push notifications (Ping)',
        'Unlocks The Van dashboard',
        'Weekly mission digest (Sunday nights)',
        'Priority support',
      ],
      stripeLink: 'https://buy.stripe.com/REPLACE_WITH_NETWORK_MONTHLY_LINK',
      stripeLinkAnnual: 'https://buy.stripe.com/REPLACE_WITH_NETWORK_ANNUAL_LINK',
    },
  ],
};

/** Returns true when the user has hit their tier's mission limit */
export function atMissionLimit(activeMissionCount: number): boolean {
  return activeMissionCount >= MODE.missionLimit;
}
