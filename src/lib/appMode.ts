/**
 * App Mode Configuration
 *
 * The same codebase ships as two products:
 *   1. "secret_agent" → my-secret-agent.com (Entry tier app, sentence-form default)
 *   2. "gia"          → go-i-agency.com    (upgrade destination, Command Center default)
 *
 * Set VITE_APP_MODE in the deployment environment to switch.
 *
 * Both apps share the SAME Supabase backend, SAME auth.users, SAME mission data.
 * Only the default view and tier limits differ.
 */

export type AppMode = 'secret_agent' | 'gia';

const rawMode = (import.meta.env.VITE_APP_MODE ?? 'secret_agent') as AppMode;
export const APP_MODE: AppMode = rawMode === 'gia' ? 'gia' : 'secret_agent';

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
  /** Which view is the default landing screen */
  defaultView: 'agent' | 'command';
  /** Active mission limit on the entry/default tier */
  missionLimit: number;
  /** Pricing tiers shown in the upgrade panel + landing page */
  tiers: TierConfig[];
  /** Browser tab title */
  documentTitle: string;
  /** Header brand color hint */
  brandAccent: 'amber' | 'emerald';
  /** Marketing landing page copy */
  landing: LandingConfig;
}

// ─── Secret Agent (App 1) ─────────────────────────────────────────────────────

const SECRET_AGENT_CONFIG: ModeConfig = {
  name: 'My Secret Agent',
  tagline: 'Watching silently in the background.',
  domain: 'my-secret-agent.com',
  defaultView: 'agent',
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

// ─── GIA (App 2) ──────────────────────────────────────────────────────────────

const GIA_CONFIG: ModeConfig = {
  name: 'GIA',
  tagline: 'Your covert operations command center.',
  domain: 'go-i-agency.com',
  defaultView: 'command',
  missionLimit: Infinity,
  documentTitle: 'GIA — Operations Hub',
  brandAccent: 'emerald',
  landing: {
    headline: 'Command center for the watchmen you can\'t hire.',
    headlineHighlight: 'Command center',
    description:
      'Run unlimited missions, monitor every signal that matters, and command your operations from one encrypted hub. Built for power users who outgrew the entry tier.',
    heroCta: 'Start Free — No credit card',
    heroCtaNote: 'Free account. Subscribe when you\'re ready. Cancel anytime.',
    pricingHeading: 'Clearance Levels',
    pricingSubhead: 'Both tiers ship with unlimited missions. Pick by feature depth.',
  },
  tiers: [
    {
      id: 'agent',
      label: 'Agent',
      price: '$14.99/mo',
      priceAnnual: '$149.99/yr',
      annualSavingsNote: '2 months free',
      missionsLabel: 'Unlimited missions',
      interval: 'Hourly checks',
      current: true,
      featureBullets: [
        'Unlimited missions',
        'Hourly checks',
        'Full Command Center dashboard',
        'Push notifications',
        'Priority support',
      ],
      stripeLink: 'https://buy.stripe.com/REPLACE_WITH_GIA_AGENT_MONTHLY_LINK',
      stripeLinkAnnual: 'https://buy.stripe.com/REPLACE_WITH_GIA_AGENT_ANNUAL_LINK',
    },
    {
      id: 'agency',
      label: 'Agency',
      price: '$29.99/mo',
      priceAnnual: '$299.99/yr',
      annualSavingsNote: '2 months free',
      missionsLabel: 'Unlimited + advanced',
      interval: 'Priority checks',
      highlight: true,
      featureBullets: [
        'Unlimited missions',
        'Priority hourly checks',
        'Full Command Center dashboard',
        'Push, email & SMS alerts',
        'Advanced filters & rules',
        'Premium support',
      ],
      stripeLink: 'https://buy.stripe.com/REPLACE_WITH_GIA_AGENCY_MONTHLY_LINK',
      stripeLinkAnnual: 'https://buy.stripe.com/REPLACE_WITH_GIA_AGENCY_ANNUAL_LINK',
    },
  ],
};

// ─── Active config ────────────────────────────────────────────────────────────

const baseConfig: ModeConfig = APP_MODE === 'gia' ? GIA_CONFIG : SECRET_AGENT_CONFIG;

// Allow VITE_APP_NAME to override the brand display name without a code change
const envName = (import.meta.env.VITE_APP_NAME as string | undefined)?.trim();

export const MODE: ModeConfig = {
  ...baseConfig,
  name: envName || baseConfig.name,
  documentTitle: envName || baseConfig.documentTitle,
};

export const isSecretAgent = APP_MODE === 'secret_agent';
export const isGIA = APP_MODE === 'gia';

/** Returns true when the user has hit their tier's mission limit */
export function atMissionLimit(activeMissionCount: number): boolean {
  return activeMissionCount >= MODE.missionLimit;
}
