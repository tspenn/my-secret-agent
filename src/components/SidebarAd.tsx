import { useState } from 'react';
import { type Ad, AD_DISCLOSURE_SUFFIX } from '../lib/ads';
import AdPanel from './AdPanel';

interface SidebarAdProps {
  ad: Ad;
}

/** Desktop sidebar — same 1536×1024 contain slot as the feed. */
export default function SidebarAd({ ad }: SidebarAdProps) {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setPanelOpen(true)}
        className="sidebar-ad"
        aria-label={`${ad.headline}${AD_DISCLOSURE_SUFFIX}`}
      >
        <div className="ad-hero">
          <img src={ad.image} alt="" className="ad-hero__img" />
        </div>
        <div className="ad-feed-card__bar">
          <span className="ad-feed-card__sponsored">Sponsored</span>
          <span className="ad-feed-card__cta">{ad.ctaText} →</span>
        </div>
      </button>
      {panelOpen && <AdPanel ad={ad} onClose={() => setPanelOpen(false)} />}
    </>
  );
}
