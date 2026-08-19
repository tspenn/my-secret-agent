import { type Ad, AD_DISCLOSURE_SUFFIX } from '../lib/ads';

interface SidebarAdProps {
  ad: Ad;
  onOpen: () => void;
}

/** Desktop sidebar card — opens the column reader on this side. */
export default function SidebarAd({ ad, onOpen }: SidebarAdProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
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
  );
}
