/**
 * My Secret Agent — Ad System
 *
 * Creatives live in the shared Supabase Storage bucket `Ads`:
 *   {VITE_SUPABASE_URL}/storage/v1/object/public/Ads/{filename}
 *
 * Free tier only. Never say “app” in visitor-facing copy —
 * say web based, companion, tool, utility, at your fingertips, all your devices.
 *
 * Frames:
 *   AdCard          4:5 (16:9 if video or a wide still)
 *   AdPanel         16:9
 *   SidebarAd       1:1
 *   ProductAdCard   4:5 / 16:9 / 1:1 / 728×90
 */

import { MODE } from './appMode';

export interface Ad {
  id: string;
  label: string;
  headline: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  panelTitle?: string;
  panelParagraphs?: string[];
  panelBullets?: string[];
  panelLinks?: Array<{ label: string; url: string }>;
  video?: string;
  image?: string;
  layout?: 'default' | 'product';
  brand?: string;
  price?: string;
  sizeLabel?: string;
  tagline?: string;
  blurb?: string;
  imagePortrait?: string;
  imageWide?: string;
  overlayTitle?: string;
  overlayLine?: string;
}

const ADS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/Ads`;
const FRIDAY_HELP = 'https://www.getfridayshelp.com';
const SKYLAND = 'https://www.skylandapps.com';

const agentTier = MODE.tiers.find((t) => t.id === 'agent');
const networkTier = MODE.tiers.find((t) => t.id === 'network');

function asset(filename: string): string {
  return `${ADS_BASE}/${filename.replace(/ /g, '%20')}`;
}

const FRIDAY_STILL = asset('friday-margaret-banner.jpg');
const FRIDAY_PLANS = [
  'Intro — 30 days free. No credit card.',
  'Lite — $5.99/mo or $59.90/yr',
  'Busy — $14.99/mo or $149/yr',
  'It’s Complicated — $29.99/mo or $299/yr',
  'Desk — $79.99/mo',
];

function fridayUnit(
  id: string,
  headline: string,
  ctaUrl: string,
  panelTitle: string,
  doorIn: string,
  storyLabel?: string,
): Ad {
  const panelLinks = [
    { label: 'Get Friday’s Help', url: FRIDAY_HELP },
    { label: 'Tour', url: `${FRIDAY_HELP}/tour` },
    { label: 'fridaycanvas.com', url: 'https://fridaycanvas.com/' },
  ];
  if (storyLabel && ctaUrl !== FRIDAY_HELP) {
    panelLinks.unshift({ label: storyLabel, url: ctaUrl });
  }
  return {
    id,
    label: 'From FRIDAY Canvas',
    headline,
    description: doorIn,
    ctaText: 'Get Friday’s Help',
    ctaUrl,
    image: FRIDAY_STILL,
    panelTitle,
    panelParagraphs: [
      doorIn,
      'FRIDAY Canvas is one workspace for your thoughts, projects, and workload — at your fingertips, on all your devices.',
      'A private notebook with a safe, friendly assistant beside you. Toggle the assistant off when you want to shut the office door.',
      '30 days free. No credit card. Cancel anytime.',
    ],
    panelBullets: FRIDAY_PLANS,
    panelLinks,
  };
}

export function adMediaUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
    return path;
  }
  return asset(path);
}

export function hasAdMedia(ad: Ad): boolean {
  return Boolean(ad.image || ad.video || ad.imagePortrait || ad.imageWide);
}

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
      'Five active watches, checked every hour, at your fingertips on all your devices.',
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
      'Twenty active watches, The Van, faster checks, and a weekly digest on Sunday nights.',
    ],
    panelBullets: networkTier?.featureBullets,
    panelLinks: networkTier?.stripeLinkAnnual
      ? [{ label: 'Or pay annually — 2 months free', url: networkTier.stripeLinkAnnual }]
      : undefined,
  },
  {
    id: 'ad-gonews-premium',
    label: 'From Skyland Suite',
    headline: 'Go News Premium',
    description: 'Save stories, folders, and offline reading — your personal briefing.',
    ctaText: 'Upgrade to Premium',
    ctaUrl: 'https://go-news.app/?upgrade=true',
    video: asset('Premium saves.mp4'),
    panelTitle: 'Go News Premium — your personal intelligence briefing',
    panelParagraphs: [
      'A web-based news companion. Save stories to your library, organize them into folders, and read offline anywhere.',
      'Premium includes everything in Pro — all 10 topic filters, ad-free reading, and cloud sync — plus full-text archive and offline reading.',
    ],
    panelBullets: [
      'Save stories and create custom folders',
      'Full article text archived automatically',
      'Offline reading when you have no connection',
      'Premium $9.99/mo or $89.91/yr — 3 months free',
    ],
    panelLinks: [
      { label: 'Upgrade to Premium', url: 'https://go-news.app/?upgrade=true' },
      { label: 'Product details', url: `${SKYLAND}/go-news-app/` },
    ],
  },
  {
    id: 'ad-gonews-plans',
    label: 'From Skyland Suite',
    headline: 'Go News plans',
    description: 'Keeping tabs on all the things that matter. Light, fast, all your devices.',
    ctaText: 'See what’s inside',
    ctaUrl: 'https://go-news.app/?upgrade=true',
    image: asset('gonews-agent-banner.jpg'),
    panelTitle: 'What’s inside a Go News subscription',
    panelParagraphs: [
      'Keeping tabs on all the things that matter. Not just one thing. Not just one take.',
      'Your personal news companion for every story, every category, and everything happening in the world right now — without algorithm games.',
    ],
    panelBullets: [
      'Go News Free — $0 forever: All Headlines feed, story search, ad-supported. No credit card.',
      'Basic — $3.99/mo or $35.91/yr: any 3 topic filters, ad-free, cloud sync.',
      'Pro — $5.99/mo or $53.91/yr: all 10 filters, ad-free, cloud sync.',
      'Premium — $9.99/mo or $89.91/yr: everything in Pro plus save, folders, full-text archive, and offline reading.',
    ],
    panelLinks: [
      { label: 'See plans / upgrade', url: 'https://go-news.app/?upgrade=true' },
      { label: 'Product details', url: `${SKYLAND}/go-news-app/` },
    ],
  },
  {
    id: 'ad-go-shop',
    label: 'From Skyland Suite',
    headline: 'Go Shop!',
    description: 'Web based companion — List, Stock, Plan, Catalog, Budget, Recipes, Projects.',
    ctaText: 'Try Go Shop! free',
    ctaUrl: 'https://www.my-go-shop.com/',
    image: asset('go-shop-banner-mobile.png'),
    panelTitle: 'Go Shop! — a web based shopping companion',
    panelParagraphs: [
      'A web based companion for the list, the pantry, the trip, the recipes, and the bigger home jobs — at your fingertips, on all your devices.',
      'List, Stock, Plan, Catalog, Budget, Recipes, Projects. Private, secure, and it will not bloat the device.',
    ],
    panelBullets: [
      'Intro — $0. Lists, trips, stock, recipes. No credit card.',
      'My Go Shop — $3.99/mo or $35.91/yr.',
      'Family — $5.99/mo or $53.91/yr. One household list, up to three people.',
    ],
    panelLinks: [
      { label: 'Open Go Shop!', url: 'https://www.my-go-shop.com/' },
      { label: 'Product details', url: `${SKYLAND}/go-shop/` },
    ],
  },
  {
    id: 'ad-my-support-agent',
    label: 'From Skyland Suite',
    headline: 'Your inbox is chaos…',
    description: 'Inbox → suggested reply + next step. Start free, no credit card.',
    ctaText: 'Start free',
    ctaUrl: 'https://www.my-support-agent.com/',
    image: asset('msa-agent-banner.png'),
    panelTitle: 'Your inbox is chaos.',
    panelParagraphs: [
      'My Support Agent meets every message with wording you can paste into your own reply, plus how to resolve it.',
      'You train it to know your business. Start free. No credit card.',
    ],
    panelLinks: [
      { label: 'Start free — no credit card', url: 'https://www.my-support-agent.com/' },
      { label: 'Product details', url: `${SKYLAND}/my-support-agent-2/` },
    ],
  },
  fridayUnit(
    'ad-friday-canvas',
    'Too many tabs. Too many thoughts.',
    FRIDAY_HELP,
    'FRIDAY Canvas',
    'For people with too many tabs and too many thoughts.',
  ),
  fridayUnit(
    'ad-friday-margaret',
    '17 tabs, still organized',
    `${FRIDAY_HELP}/margaret`,
    'Margaret — thoughts, projects, and what’s next',
    'Margaret has it sorted — thoughts, projects, and what’s next in one place.',
    'Margaret’s story',
  ),
  fridayUnit(
    'ad-friday-sarah',
    'Thoughts, projects, next step',
    FRIDAY_HELP,
    'Sarah — how FRIDAY Canvas organizes the work',
    'How FRIDAY Canvas organizes thoughts, projects, and next steps.',
  ),
  fridayUnit(
    'ad-friday-marcus',
    'Work and life, one picture',
    FRIDAY_HELP,
    'Marcus — work and life in one picture',
    'Keep work and life in one clear picture.',
  ),
  fridayUnit(
    'ad-friday-ed',
    'Night ideas still there in the morning',
    FRIDAY_HELP,
    'Ed — capture ideas at night',
    'Capture ideas at night before they disappear.',
  ),
  fridayUnit(
    'ad-friday-annie',
    'Business that was still in her head',
    `${FRIDAY_HELP}/annie`,
    'Annie — run a business from the ideas in your head',
    'Run a business from the ideas in your head.',
    'Annie’s story',
  ),
  fridayUnit(
    'ad-friday-annie-jay',
    'What’s done, what’s next',
    FRIDAY_HELP,
    'Annie and Jay — what’s done, what’s next',
    'What’s done, what’s next, what you want to do.',
  ),
  {
    id: 'ad-hearts-daisies-backpack',
    label: 'Back Alley Shoppe',
    brand: 'Back Alley Shoppe',
    headline: 'Hearts and Daisies Large Backpack',
    description: 'Design exclusive to Back Alley. $185 · One Size.',
    ctaText: 'Shop the backpack',
    ctaUrl:
      'https://buy.fineshoppes.com/products/hearts-and-daisies-back-alley-shoppe-large-backpack-all-over-print-casual-backpack-large-model-1733?variant=45820672180385',
    image:
      'https://buy.fineshoppes.com/cdn/shop/files/1f0e8c7fcfd6264999b7058492d5ef37.jpg?v=1773505669&width=1200',
    imagePortrait:
      'https://buy.fineshoppes.com/cdn/shop/files/1f0e8c7fcfd6264999b7058492d5ef37.jpg?v=1773505669&width=1200',
    imageWide:
      'https://buy.fineshoppes.com/cdn/shop/files/e91d7e1862a388a1b1e4723e2bc8f795.jpg?v=1773505668&width=1200',
    layout: 'product',
    price: '$185',
    sizeLabel: 'One Size',
    tagline: 'Design Exclusive to Back Alley',
    blurb: 'All-over print, roomy enough for the day — carried quietly, noticed anyway.',
  },
];

export function adsWithMedia(): Ad[] {
  return ADS.filter(hasAdMedia);
}

export function productAds(): Ad[] {
  return ADS.filter((a) => a.layout === 'product' && hasAdMedia(a));
}

/** Both side columns stack every media unit. Right column reverses the order. */
export function adsForSide(side: 'left' | 'right'): Ad[] {
  const units = adsWithMedia();
  return side === 'right' ? [...units].reverse() : units;
}

/** Feed AdCard is 16:9 when there is a video, otherwise start 4:5 and flip if the still is wide. */
export function feedStartsWide(ad: Ad): boolean {
  return Boolean(ad.video);
}
