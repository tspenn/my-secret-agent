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
  price: string;
  trial?: string;
  trialNote?: string;
  missionsLabel: string;
  interval: string;
  current?: boolean;
  highlight?: boolean;
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
  /** Pricing tiers shown in the upgrade panel */
  tiers: TierConfig[];
  /** Browser tab title */
  documentTitle: string;
  /** Header brand color hint */
  brandAccent: 'amber' | 'emerald';
}

// ─── Secret Agent (App 1) ─────────────────────────────────────────────────────

const SECRET_AGENT_CONFIG: ModeConfig = {
  name: 'My Secret Agent',
  tagline: 'Watching silently in the background.',
  domain: 'my-secret-agent.com',
  defaultView: 'agent',
  missionLimit: 4,
  documentTitle: 'My Secret Agent',
  brandAccent: 'amber',
  tiers: [
    {
      id: 'entry',
      label: 'Entry',
      price: '$4.99/mo',
      trial: '10 days free',
      trialNote: 'No credit card — just an email to start.',
      missionsLabel: '3–4 missions',
      interval: 'Hourly checks',
      current: true,
    },
    {
      id: 'agent',
      label: 'Agent',
      price: '$14.99/mo',
      missionsLabel: 'Unlimited missions',
      interval: 'Hourly checks',
      highlight: true,
    },
    {
      id: 'agency',
      label: 'Agency',
      price: '$29.99/mo',
      missionsLabel: 'Unlimited + advanced',
      interval: 'Priority checks',
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
  tiers: [
    {
      id: 'agent',
      label: 'Agent',
      price: '$14.99/mo',
      missionsLabel: 'Unlimited missions',
      interval: 'Hourly checks',
      current: true,
    },
    {
      id: 'agency',
      label: 'Agency',
      price: '$29.99/mo',
      missionsLabel: 'Unlimited + advanced',
      interval: 'Priority checks',
      highlight: true,
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
