/**
 * House ads — local catalog only.
 *
 * skylandapps.com and getfridayshelp.com are Cursor/Vercel sites.
 * They are the wording, link, and image source. Do not fetch them at runtime.
 *
 * Heroes: https://www.skylandapps.com/{name}-hero.png
 * Landscape 1536×1024. Slots use aspect-[1536/1024] + object-contain
 * on charcoal. Do not object-cover. Do not change column width.
 *
 * Free / Intro only. Paid plans see no ads.
 * Never say “app.” Say tool, companion, web-based, place.
 */

import { MODE } from './appMode';

export interface Ad {
  id: string;
  label: string;
  headline: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  image: string;
  video?: string;
  panelTitle?: string;
  panelParagraphs?: string[];
  panelBullets?: string[];
  panelLinks?: Array<{ label: string; url: string }>;
}

export const AD_DISCLOSURE_SUFFIX = ' - sponsored';

const SKYLAND = 'https://www.skylandapps.com';
const FRIDAY_HELP = 'https://www.getfridayshelp.com';
const SUITE = 'From Skyland Suite';

const agentTier = MODE.tiers.find((t) => t.id === 'agent');
const networkTier = MODE.tiers.find((t) => t.id === 'network');

function hero(file: string): string {
  return `${SKYLAND}/${file}`;
}

export function adMediaUrl(path: string): string {
  return path;
}

export const ADS: Ad[] = [
  {
    id: 'sa-upgrade',
    label: 'My Secret Agent',
    headline: 'Watch more. Upgrade when you need to.',
    description:
      'Free is 1 watch, checked daily. Agent is 5, hourly. Network is 20, plus The Van and a Sunday digest.',
    ctaText: 'Upgrade to Agent',
    ctaUrl: agentTier?.stripeLink ?? 'https://www.my-secret-agent.com',
    image: hero('my-secret-agent-hero.png'),
    panelTitle: 'Agent and Network',
    panelParagraphs: [
      'Your covert operative watches prices, stocks, weather, and websites, then Pings you when something changes. Push only — no SMS.',
      'Free is 1 active watch. Agent is $4.99/mo for 5. Network is $14.99/mo for 20. Deactivate one to add another.',
    ],
    panelBullets: [
      'Free — 1 active watch, daily checks, Ping. No card.',
      'Agent — $4.99/mo or $49.99/yr: 5 watches, hourly checks.',
      'Network — $14.99/mo or $149.99/yr: 20 watches, The Van, Sunday digest.',
    ],
    panelLinks: [
      { label: 'Upgrade to Agent', url: agentTier?.stripeLink ?? 'https://www.my-secret-agent.com' },
      ...(networkTier?.stripeLink
        ? [{ label: 'Upgrade to Network', url: networkTier.stripeLink }]
        : []),
      { label: 'Product details', url: `${SKYLAND}/my-secret-agent/` },
    ],
  },
  {
    id: 'ad-go-shop',
    label: SUITE,
    headline: 'Shopping that thinks the way you do.',
    description:
      'A web-based shopping companion — private, secure, and it will not bloat the device. Lists, recipes, trip planning, stock tracking, projects, and a budget — remembered, reusable, ready for the next store run.',
    ctaText: 'Open Go Shop!',
    ctaUrl: 'https://www.my-go-shop.com/',
    image: hero('go-shop-hero.png'),
    panelTitle: 'Shopping that thinks the way you do.',
    panelParagraphs: [
      'A web-based shopping companion — private, secure, and it will not bloat the device. Lists, recipes, trip planning, stock tracking, projects, and a budget — remembered, reusable, ready for the next store run.',
      'List, Stock, Plan, Catalog, Recipes, Projects, Budget. Phone or computer. Same lists. Nothing to download from a store.',
    ],
    panelBullets: [
      'Intro — ad-supported, no card.',
      'My Go Shop — $3.99/mo or $35.91/yr (3 months free).',
      'Family — $5.99/mo or $53.91/yr, one household list, up to three people.',
    ],
    panelLinks: [
      { label: 'Open Go Shop!', url: 'https://www.my-go-shop.com/' },
      { label: 'Product details', url: `${SKYLAND}/go-shop/` },
    ],
  },
  {
    id: 'ad-go-news',
    label: SUITE,
    headline: 'Keeping tabs on all the things that matter.',
    description:
      'Web-based news companion — light, fast, all your devices. World, Africa, faith, geopolitics, sports, fashion, lifestyle, and tech. No store. No bloat.',
    ctaText: 'Start reading',
    ctaUrl: 'https://go-news.app/?upgrade=true',
    image: hero('go-news-hero.png'),
    panelTitle: 'Keeping tabs on all the things that matter.',
    panelParagraphs: [
      'Web-based news companion — light, fast, all your devices. World, Africa, faith, geopolitics, sports, fashion, lifestyle, and tech. No store. No bloat.',
      'Ten topic filters (Basic = any 3; Pro and Premium = all 10). Search. Clean reader. Premium save, folders, and offline.',
    ],
    panelBullets: [
      'Free — All Headlines and search.',
      'Basic — $3.99/mo: any 3 topic filters.',
      'Pro — $5.99/mo: all 10 filters.',
      'Premium — $9.99/mo: save, folders, offline. Annual is 3 months free.',
    ],
    panelLinks: [
      { label: 'See plans', url: 'https://go-news.app/?upgrade=true' },
      { label: 'Product details', url: `${SKYLAND}/go-news-app/` },
    ],
  },
  {
    id: 'ad-friday-canvas',
    label: SUITE,
    headline: 'Contain it all — done, in progress, and next.',
    description:
      'For creators, founders, and busy minds who need a way to contain it all — a snapshot of what’s done, in progress, and next.',
    ctaText: 'What is FRIDAY Canvas?',
    ctaUrl: 'https://fridaycanvas.com/',
    image: hero('friday-canvas-hero.png'),
    panelTitle: 'FRIDAY Canvas',
    panelParagraphs: [
      'For creators, founders, and busy minds who need a way to contain it all — a snapshot of what’s done, in progress, and next.',
      'Each project gets a WorkZone. FRIDAY can sort it and show you how — or you turn the assistant off.',
      '30 days free. No card.',
    ],
    panelBullets: [
      'WorkZones so each project stays findable.',
      'FRIDAY beside you, or off.',
      '30 days free. No credit card. Cancel anytime.',
    ],
    panelLinks: [
      { label: 'What is FRIDAY Canvas?', url: 'https://fridaycanvas.com/' },
      { label: 'Get Friday’s help!', url: FRIDAY_HELP },
      { label: 'Product details', url: `${SKYLAND}/friday-canvas/` },
      { label: 'Margaret', url: `${FRIDAY_HELP}/uncategorized/margaret-friday_canvas/` },
    ],
  },
  {
    id: 'ad-lnklokr',
    label: SUITE,
    headline: 'Copy it. Tap a category. It stays on the device.',
    description:
      'Copy a link, image, or text, then tap Keep, Borrow, Share, or Bury. No sign-up. PIN on Bury.',
    ctaText: 'Open LnkLokr',
    ctaUrl: 'https://lnklokr.com/',
    image: hero('lnklokr-hero.png'),
    panelTitle: 'LnkLokr',
    panelParagraphs: [
      'Copy a link, image, or scrap of text, then tap a category. Keep what you need, Borrow what’s temporary, Share what you send, or Bury it behind a PIN.',
      'No sign-up. It stays on the device. Light, dark, or Office.',
    ],
    panelBullets: ['Keep / Borrow / Share / Bury', 'PIN on Bury', 'No sign-up'],
    panelLinks: [
      { label: 'Open LnkLokr', url: 'https://lnklokr.com/' },
      { label: 'Product details', url: `${SKYLAND}/lnklokr/` },
    ],
  },
  {
    id: 'ad-my-support-agent',
    label: SUITE,
    headline: 'Wording you can paste, plus how to resolve it.',
    description:
      'A dedicated inbox for support, sales, or questions. The suggestion is copy-and-insert, not a drafted email.',
    ctaText: 'Start the 14-day trial',
    ctaUrl: 'https://www.my-support-agent.com/',
    image: hero('my-support-agent-hero.png'),
    panelTitle: 'My Support Agent',
    panelParagraphs: [
      'A dedicated inbox for support, sales, or questions. Your agent meets every message with wording you can paste into your own reply, plus how to resolve it.',
      'The suggestion is copy-and-insert, not a drafted email. You train it to know your business.',
    ],
    panelBullets: [
      'Specialist — $19.99/mo or $179.91/yr. 14-day trial, no card.',
      'Command — $39.99/mo.',
      'Enterprise — custom.',
    ],
    panelLinks: [
      { label: 'Start the 14-day trial', url: 'https://www.my-support-agent.com/' },
      { label: 'Product details', url: `${SKYLAND}/my-support-agent-2/` },
    ],
  },
  {
    id: 'ad-lokr',
    label: SUITE,
    headline: 'Your own encrypted locker.',
    description:
      'Private messaging for the people and files you actually care about. Not Gmail, not Outlook, not the open internet.',
    ctaText: 'Open LOKR',
    ctaUrl: 'https://my-lokr.com/',
    image: hero('my-lokr-hero.png'),
    panelTitle: 'LOKR',
    panelParagraphs: [
      'LOKR is your own encrypted information locker. A locked place for families, small teams, and businesses — not Gmail, not Outlook, not the open internet.',
      'Invitees never get a bill. Start free. Stay free unless you need more.',
    ],
    panelBullets: [
      'Free — you plus 3 per group.',
      'Business — $19/user/mo.',
      'Vault add-ons when you need them.',
    ],
    panelLinks: [
      { label: 'Open LOKR', url: 'https://my-lokr.com/' },
      { label: 'Product details', url: `${SKYLAND}/my-lokr/` },
    ],
  },
  {
    id: 'ad-toc',
    label: SUITE,
    headline: 'The whole board, not a chat scroll.',
    description:
      'TOC puts every major Directive for your leadership team in your hand. Brief, files, owner, close.',
    ctaText: 'Open TOC',
    ctaUrl: 'https://mytoc.app/',
    image: hero('toc-hero.png'),
    panelTitle: 'TOC',
    panelParagraphs: [
      'Tactical Operations Command for COOs and chiefs of staff. Open a Directive, attach the brief, name the owner, watch what’s current, close it yourself.',
      'This is command — the whole board, not a chat scroll. 14-day trial, no card.',
    ],
    panelBullets: [
      'Solo Command — $19/mo or $190/yr.',
      'Team Command — $49/mo or $490/yr.',
      '14-day trial, no credit card.',
    ],
    panelLinks: [
      { label: 'Open TOC', url: 'https://mytoc.app/' },
      { label: 'Product details', url: `${SKYLAND}/my-toc/` },
    ],
  },
  {
    id: 'ad-chkchk',
    label: SUITE,
    headline: 'Assign. Track. Confirm.',
    description:
      'The Lead assigns the job, the team works the list, and nothing is done until the Lead signs off.',
    ctaText: 'Open ChkChk',
    ctaUrl: 'https://chkchk.app/',
    image: hero('chkchk-hero.png'),
    panelTitle: 'ChkChk',
    panelParagraphs: [
      'A work-order tracker for families, coaches, and small crews. The Lead assigns the job, the team works the list, and nothing is done until the Lead signs off.',
      '14-day trial. Annual is 2 months free.',
    ],
    panelBullets: [
      'Captain — $3.99/mo.',
      'Coach — $9.99/mo.',
      'Admin — $14.99/mo.',
    ],
    panelLinks: [
      { label: 'Open ChkChk', url: 'https://chkchk.app/' },
      { label: 'Product details', url: `${SKYLAND}/chkchk/` },
    ],
  },
  {
    id: 'ad-mny',
    label: SUITE,
    headline: 'One button, one answer.',
    description: 'Know exactly what you can spend right now — before your next paycheck.',
    ctaText: 'See My$',
    ctaUrl: 'https://my-mny.com/',
    image: hero('mny-hero.png'),
    panelTitle: 'My$',
    panelParagraphs: [
      'One button, one answer. Know exactly what you can spend right now, after bills and before payday.',
    ],
    panelBullets: [
      'Free.',
      'Starter — $3.99/mo.',
      'Plus — $6.99/mo.',
      'Pro — $9.99/mo.',
    ],
    panelLinks: [
      { label: 'Open My$', url: 'https://my-mny.com/' },
      { label: 'Product details', url: `${SKYLAND}/mny/` },
    ],
  },
  {
    id: 'ad-mny-business',
    label: SUITE,
    headline: 'The real number now — not a month-end P&L.',
    description:
      'Live available-to-spend across operating accounts, division budgets, credit lines, and payroll.',
    ctaText: 'See MNY$',
    ctaUrl: 'https://my-mny.com/business',
    image: hero('mny-business-hero.png'),
    panelTitle: 'MNY$',
    panelParagraphs: [
      'Live available-to-spend across operating accounts, division budgets, credit lines, and upcoming bills or payroll. Built for founders and operators who need the real number now — not a month-end P&L.',
    ],
    panelLinks: [
      { label: 'Open MNY$', url: 'https://my-mny.com/business' },
      { label: 'Product details', url: `${SKYLAND}/mnybusiness` },
    ],
  },
  {
    id: 'ad-gia',
    label: SUITE,
    headline: 'Deploy operatives on the signals that move you.',
    description:
      'Go Intelligence Agency. Markets, competitors, and signals. Almost ready.',
    ctaText: 'See GIA',
    ctaUrl: 'https://go-i-agency.com/',
    image: hero('gia-hero.png'),
    panelTitle: 'GIA — Go Intelligence Agency',
    panelParagraphs: [
      'Go Intelligence Agency. Deploy operatives on the markets, competitors, and signals that move your business.',
      'Almost ready.',
    ],
    panelLinks: [
      { label: 'go-i-agency.com', url: 'https://go-i-agency.com/' },
      { label: 'Product details', url: `${SKYLAND}/gia/` },
    ],
  },
];

export function adsWithMedia(): Ad[] {
  return ADS.filter((a) => a.image || a.video);
}

export function adsForSide(side: 'left' | 'right'): Ad[] {
  const units = adsWithMedia();
  return side === 'right' ? [...units].reverse() : units;
}
