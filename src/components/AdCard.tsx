import { useState, useRef } from 'react';
import { type Ad, AD_DISCLOSURE_SUFFIX } from '../lib/ads';
import AdPanel from './AdPanel';

interface AdCardProps {
  ad: Ad;
}

/** Feed house unit. Stills are 1536×1024 contain. Video is 16:9. */
export default function AdCard({ ad }: AdCardProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => setPanelOpen(true)}
        className="ad-feed-card group"
        aria-label={`${ad.headline}${AD_DISCLOSURE_SUFFIX}`}
      >
        <div className={ad.video ? 'ad-hero ad-hero--video' : 'ad-hero'}>
          {ad.video ? (
            <video
              ref={videoRef}
              src={ad.video}
              poster={ad.image}
              className="ad-hero__video"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img src={ad.image} alt="" className="ad-hero__img" />
          )}
        </div>
        <div className="ad-feed-card__bar">
          <span className="ad-feed-card__sponsored">Sponsored</span>
          <span className="ad-feed-card__cta">{ad.ctaText} →</span>
        </div>
        {ad.headline && (
          <p className="ad-feed-card__title">
            {ad.headline}
            <span className="ad-feed-card__disclosure">{AD_DISCLOSURE_SUFFIX}</span>
          </p>
        )}
      </button>
      {panelOpen && <AdPanel ad={ad} onClose={() => setPanelOpen(false)} />}
    </>
  );
}
