/**
 * My Secret Agent — Ad System
 *
 * Ads show only to free-tier users (1-mission plan).
 * All media hosted on Supabase Storage public bucket: "ads"
 *
 * Three placements:
 *   1. In-app card  — appears below the mission list on the Agent Brief view
 *   2. Left sidebar — desktop only, 33% width, square media
 *   3. Right sidebar — desktop only, same spec, reverse order
 *
 * Media specs:
 *   In-app card:  16:9 — image 1200×675px, video 1280×720px MP4/H.264 <3MB
 *   Sidebars:     1:1  — image 600×600px,  video 600×600px or 1280×720 center-cropped
 */

export interface Ad {
  id: string;
  label: string;
  headline: string;
  description: string;
  ctaText?: string;
  ctaUrl: string;
  /** Supabase Storage path inside the "ads" bucket, e.g. "my-secret-agent/nordstrom-card.mp4" */
  video?: string;
  /** Supabase Storage path inside the "ads" bucket, e.g. "my-secret-agent/nordstrom-card.jpg" */
  image?: string;
  /** AdPanel content — shown when user clicks the ad */
  panelTitle?: string;
  panelParagraphs?: string[];
  panelBullets?: string[];
  panelLinks?: { label: string; url: string }[];
}

const STORAGE_BASE = 'https://psbdjnqcjpxapypcfigx.supabase.co/storage/v1/object/public/ads';

/** Resolve a storage path to a full public URL */
export function adMediaUrl(path: string): string {
  return `${STORAGE_BASE}/${path}`;
}

/**
 * Master ad list. Add new ads here.
 * Ads without image or video are filtered out of sidebars automatically.
 * Order determines rotation — sidebars show in reverse order relative to main.
 */
export const ADS: Ad[] = [
  {
    id: 'placeholder-1',
    label: 'Sponsored',
    headline: 'Your ad could be here',
    description: 'Reach people who are already watching for deals, prices, and real-world signals.',
    ctaText: 'Learn More',
    ctaUrl: 'mailto:ads@my-secret-agent.com',
    panelTitle: 'Advertise on My Secret Agent',
    panelParagraphs: [
      'My Secret Agent users are already primed to act — they\'ve set up missions to watch for exactly the kind of signals your brand creates.',
      'Reach deal-hunters, investors, and informed buyers at the moment they\'re most engaged.',
    ],
    panelBullets: [
      'In-app cards and sidebar placements',
      'Free-tier audience only — no ad fatigue for paid subscribers',
      'Direct response or brand awareness formats',
    ],
    panelLinks: [
      { label: 'Contact us', url: 'mailto:ads@my-secret-agent.com' },
    ],
  },
];

/** Only return ads that have media (image or video) — used by sidebars */
export function adsWithMedia(): Ad[] {
  return ADS.filter((a) => a.image || a.video);
}
