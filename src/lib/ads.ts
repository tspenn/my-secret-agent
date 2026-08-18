/**
 * My Secret Agent — Ad System
 *
 * Ads show only to free-tier users (1-mission plan).
 * House ads: Secret Agent Agent/Network upsells, plus Skyland Suite.
 * FRIDAY Canvas copy and links come from getfridayshelp.com.
 *
 * Layout (desktop ≥ 1200px, free plan): 30% ads | 40% brief | 30% ads.
 * Side cards: 1550×1550 frame, 1536×1024 creative centered inside.
 * Tablet/mobile: same cards stacked full-width under the brief.
 *
 * Paid plans keep the same 40% center with empty side columns.
 */

import { MODE } from './appMode';

export interface Ad {
  id: string;
  label: string;
  headline: string;
  description: string;
  ctaText?: string;
  ctaUrl: string;
  /** Public path, absolute URL, or Supabase Storage path inside the "ads" bucket. */
  video?: string;
  /** Public path, absolute URL, or Supabase Storage path inside the "ads" bucket. */
  image?: string;
  /** Optional title drawn over the bottom of the column card. */
  overlayTitle?: string;
  /** Optional line under the overlay title. */
  overlayLine?: string;
  /** AdPanel content — shown when user clicks the in-feed card */
  panelTitle?: string;
  panelParagraphs?: string[];
  panelBullets?: string[];
  panelLinks?: { label: string; url: string }[];
}

const STORAGE_BASE = 'https://psbdjnqcjpxapypcfigx.supabase.co/storage/v1/object/public/ads';
const SKYLAND = 'https://www.skylandapps.com';
const FRIDAY_HELP = 'https://www.getfridayshelp.com';

const agentTier = MODE.tiers.find((t) => t.id === 'agent');
const networkTier = MODE.tiers.find((t) => t.id === 'network');

/** Resolve a storage path, site-relative path, or absolute URL. */
export function adMediaUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
    return path;
  }
  return `${STORAGE_BASE}/${path}`;
}

/**
 * Master ad list. Even index → left column, odd index → right column.
 */
export const ADS: Ad[] = [
  {
    id: 'sa-agent',
    label: 'My Secret Agent',
    headline: 'Agent',
    description: '5 active watches. Hourly checks. All watch types. $4.99/mo.',
    ctaText: 'Upgrade to Agent',
    ctaUrl: agentTier?.stripeLink ?? 'https://www.my-secret-agent.com',
    image: '/ads/my-secret-agent-hero.png',
    overlayTitle: 'Agent · $4.99/mo',
    overlayLine: '5 active watches · hourly checks',
    panelTitle: 'Upgrade to Agent',
    panelParagraphs: [
      'A serious casual user runs a handful of watches. Agent gives you five active missions, checked every hour.',
      'Deactivate one to add another. Push notifications (Ping) included.',
    ],
    panelBullets: agentTier?.featureBullets,
    panelLinks: agentTier?.stripeLinkAnnual
      ? [{ label: 'Or pay annually — 2 months free', url: agentTier.stripeLinkAnnual }]
      : undefined,
  },
  {
    id: 'sa-network',
    label: 'My Secret Agent',
    headline: 'Network',
    description: '20 active watches, The Van, and a Sunday digest. $14.99/mo.',
    ctaText: 'Upgrade to Network',
    ctaUrl: networkTier?.stripeLink ?? 'https://www.my-secret-agent.com',
    image: '/ads/my-secret-agent-hero.png',
    overlayTitle: 'Network · $14.99/mo',
    overlayLine: '20 watches · The Van · Sunday digest',
    panelTitle: 'Upgrade to Network',
    panelParagraphs: [
      'Run a desk of watches. Network unlocks 20 active missions, The Van dashboard, faster checks, and a weekly digest on Sunday nights.',
    ],
    panelBullets: networkTier?.featureBullets,
    panelLinks: networkTier?.stripeLinkAnnual
      ? [{ label: 'Or pay annually — 2 months free', url: networkTier.stripeLinkAnnual }]
      : undefined,
  },
  {
    id: 'friday-canvas',
    label: 'Skyland Suite',
    headline: 'FRIDAY Canvas',
    description:
      'For people with too many tabs and too many thoughts. One workspace for your thoughts, projects, and workload — with FRIDAY beside you to sort it and show you how.',
    ctaText: 'Get Friday’s Help',
    ctaUrl: FRIDAY_HELP,
    image: '/ads/friday-canvas-hero.png',
    panelTitle: 'FRIDAY Canvas',
    panelParagraphs: [
      'For people with too many tabs and too many thoughts.',
      'FRIDAY Canvas helps you capture ideas, run projects, and keep a clear picture of what you’ve done, what’s next, and what you’d like to do — with FRIDAY beside you to sort it and show you how.',
      'A simple personal notebook combined with a safe, friendly AI assistant — all in one calm, private space. Toggle the assistant off when you want to shut the office door.',
      '30 days free. No credit card. Cancel anytime.',
    ],
    panelBullets: [
      'Thoughts & ideas — capture the swirl before it disappears',
      'WorkZones so each project stays findable',
      'What you’ve done, what’s next, and what you’d like to do',
      'Your data stays yours. We do not sell it or use it to train AI models',
    ],
    panelLinks: [
      { label: 'Get Friday’s Help', url: FRIDAY_HELP },
      { label: 'See inside', url: `${FRIDAY_HELP}/details/inside` },
      { label: 'Tour', url: `${FRIDAY_HELP}/tour` },
    ],
  },
  {
    id: 'go-news',
    label: 'Skyland Suite',
    headline: 'Go News',
    description:
      'Keeping tabs on all the things that matter. Light, fast, and ready on all your devices.',
    ctaText: 'Start reading',
    ctaUrl: 'https://go-news.app/',
    image: '/ads/go-news-hero.png',
    panelTitle: 'Go News',
    panelParagraphs: [
      'A web-based news companion — not a store listing, not a 400-megabyte update.',
      'World, Africa, faith, geopolitics, sports, fashion, lifestyle, and tech. Chronological. No algorithm games.',
      'Try Go News free forever. No credit card. Upgrade when you are ready.',
    ],
    panelBullets: [
      'All Headlines feed, always fresh',
      'Ten topic filters — Basic unlocks three, Pro unlocks all ten',
      'Private reading. We do not sell your data.',
    ],
    panelLinks: [{ label: 'About Go News', url: `${SKYLAND}/go-news-app` }],
  },
  {
    id: 'gia',
    label: 'Skyland Suite',
    headline: 'GIA',
    description:
      'Go Intelligence Agency. Deploy operatives on the markets, competitors and signals that move your business.',
    ctaText: 'See GIA',
    ctaUrl: `${SKYLAND}/gia`,
    image: '/ads/gia-hero.png',
    panelTitle: 'GIA — Go Intelligence Agency',
    panelParagraphs: [
      'Your personal intelligence operation. Deploy operatives on the markets, competitors, news signals, and data sources that move your business.',
      'Get briefed when something changes. No IT department. No enterprise contract. Coming soon.',
    ],
    panelLinks: [
      { label: 'go-i-agency.com', url: 'https://go-i-agency.com' },
      { label: 'About GIA', url: `${SKYLAND}/gia` },
    ],
  },
  {
    id: 'go-shop',
    label: 'Skyland Suite',
    headline: 'Go Shop!',
    description:
      'Lists, recipes, trip planning, stock tracking, projects, and a budget — ready for the next store run.',
    ctaText: 'Open Go Shop!',
    ctaUrl: 'https://www.my-go-shop.com/',
    image: '/ads/go-shop-hero.png',
    panelTitle: 'Go Shop!',
    panelParagraphs: [
      'A web-based shopping companion — private, secure, and it will not bloat the device.',
      'Add an item once and it lands in your Catalog. Next trip takes seconds instead of a blank page.',
    ],
    panelBullets: ['List, Stock, Plan, Catalog, Budget, Recipes, Projects'],
    panelLinks: [{ label: 'About Go Shop!', url: `${SKYLAND}/go-shop` }],
  },
  {
    id: 'lnklokr',
    label: 'Skyland Suite',
    headline: 'LnkLokr',
    description:
      'Your personal content vault. Copy a link, image, or scrap of text, then tap a category. No sign-up.',
    ctaText: 'Open LnkLokr',
    ctaUrl: 'https://lnklokr.com/',
    image: '/ads/lnklokr-hero.png',
    panelTitle: 'LnkLokr',
    panelParagraphs: [
      'Keep what you need, Borrow what’s temporary, Share what you send, or Bury it behind a PIN.',
      'Everything stays on your device. We never see it.',
    ],
    panelBullets: ['Keep, Borrow, Share, Bury', 'No sign-up required'],
    panelLinks: [{ label: 'About LnkLokr', url: `${SKYLAND}/lnklokr` }],
  },
  {
    id: 'lokr',
    label: 'Skyland Suite',
    headline: 'LOKR',
    description:
      'Your own encrypted information locker. Private messaging for the people and files you actually care about.',
    ctaText: 'Open LOKR',
    ctaUrl: 'https://my-lokr.com',
    image: '/ads/my-lokr-hero.png',
    panelTitle: 'LOKR',
    panelParagraphs: [
      'A locked space for families, small teams, and businesses — not Gmail, not Outlook, not the open internet.',
      'Invitees never get a bill. Start free. Stay free — unless you need more.',
    ],
    panelLinks: [{ label: 'About LOKR', url: `${SKYLAND}/my-lokr` }],
  },
  {
    id: 'friday-desk',
    label: 'Skyland Suite',
    headline: 'FRIDAY Desk',
    description:
      'Business tier of FRIDAY Canvas. Operational clarity for leaders and growing teams — without status-meeting bloat.',
    ctaText: 'See FRIDAY Desk',
    ctaUrl: `${SKYLAND}/desk`,
    image: '/ads/friday-desk-hero.png',
    panelTitle: 'FRIDAY Desk',
    panelParagraphs: [
      'Built for leaders, managers, and growing teams who need total operational clarity.',
      'Centralizes workflows, keeps active projects visible, and aligns everyone without status-meeting bloat.',
    ],
    panelLinks: [{ label: 'About FRIDAY Desk', url: `${SKYLAND}/desk` }],
  },
  {
    id: 'support-agent',
    label: 'Skyland Suite',
    headline: 'My Support Agent',
    description:
      'Suggested reply wording and how to resolve each message, trained on your business.',
    ctaText: 'Open My Support Agent',
    ctaUrl: 'https://www.my-support-agent.com/',
    image: '/ads/my-support-agent-hero.png',
    panelTitle: 'My Support Agent',
    panelParagraphs: [
      'A dedicated inbox for support, sales, or questions. Your agent meets every message with wording you can paste into your own reply, plus how to resolve it.',
    ],
    panelLinks: [{ label: 'About My Support Agent', url: `${SKYLAND}/my-support-agent-2` }],
  },
  {
    id: 'toc',
    label: 'Skyland Suite',
    headline: 'TOC',
    description:
      'Tactical Operations Command for COOs and chiefs of staff — Directives, owners, and close, not a chat scroll.',
    ctaText: 'Open TOC',
    ctaUrl: 'https://mytoc.app',
    image: '/ads/toc-hero.png',
    panelTitle: 'TOC',
    panelParagraphs: [
      'Open a Directive, attach the brief, name the owner, watch what’s current, close it yourself.',
      '14-day trial, no credit card.',
    ],
    panelLinks: [{ label: 'About TOC', url: `${SKYLAND}/my-toc` }],
  },
  {
    id: 'chkchk',
    label: 'Skyland Suite',
    headline: 'ChkChk',
    description:
      'Assign. Track. Confirm. A work-order tracker for families, coaches, and small crews.',
    ctaText: 'Open ChkChk',
    ctaUrl: 'https://www.chkchk.app/',
    image: '/ads/chkchk-hero.png',
    panelTitle: 'ChkChk',
    panelParagraphs: [
      'The Lead assigns the job, the team works the list, and nothing is done until the Lead signs off.',
    ],
    panelLinks: [{ label: 'About ChkChk', url: `${SKYLAND}/chkchk` }],
  },
  {
    id: 'mny',
    label: 'Skyland Suite',
    headline: 'My$',
    description: 'One button, one answer. Know exactly what you can spend right now — before your next paycheck.',
    ctaText: 'See My$',
    ctaUrl: `${SKYLAND}/mny`,
    image: '/ads/mny-hero.png',
    panelTitle: 'My$',
    panelParagraphs: [
      'One number for what you can actually spend right now, after bills and before payday. In development.',
    ],
    panelLinks: [{ label: 'About My$', url: `${SKYLAND}/mny` }],
  },
  {
    id: 'mny-business',
    label: 'Skyland Suite',
    headline: 'MNY$',
    description:
      'Live available-to-spend across operating accounts, division budgets, credit lines, and upcoming bills or payroll.',
    ctaText: 'See MNY$',
    ctaUrl: `${SKYLAND}/mnybusiness`,
    image: '/ads/mny-business-hero.png',
    panelTitle: 'MNY$',
    panelParagraphs: [
      'Built for founders and operators who need the real number now — not a month-end P&L. In development.',
    ],
    panelLinks: [{ label: 'About MNY$', url: `${SKYLAND}/mnybusiness` }],
  },
];

/** Ads that have image or video media. */
export function adsWithMedia(): Ad[] {
  return ADS.filter((a) => a.image || a.video);
}

/** Split house ads across the two 30% columns. */
export function adsForSide(side: 'left' | 'right'): Ad[] {
  return adsWithMedia().filter((_, i) => (side === 'left' ? i % 2 === 0 : i % 2 === 1));
}
