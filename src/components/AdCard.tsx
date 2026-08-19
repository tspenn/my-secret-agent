import { useState, useRef } from 'react';
import { type Ad, adMediaUrl, feedStartsWide } from '../lib/ads';
import AdPanel from './AdPanel';

interface AdCardProps {
  ad: Ad;
}

/** In-feed house unit. 4:5 by default; 16:9 if there is a video or the still is wider than tall. */
export default function AdCard({ ad }: AdCardProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [wide, setWide] = useState(feedStartsWide(ad));
  const videoRef = useRef<HTMLVideoElement>(null);
  const still = ad.image ?? ad.imagePortrait ?? ad.imageWide;

  return (
    <>
      <button
        type="button"
        onClick={() => setPanelOpen(true)}
        className="ad-feed-card group"
        aria-label={ad.headline || ad.panelTitle || ad.label}
      >
        <div className={`ad-feed-card__frame ${wide ? 'ad-feed-card__frame--wide' : 'ad-feed-card__frame--portrait'}`}>
          {ad.video ? (
            <video
              ref={videoRef}
              src={adMediaUrl(ad.video)}
              poster={still ? adMediaUrl(still) : undefined}
              className="ad-feed-card__media"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : still ? (
            <img
              src={adMediaUrl(still)}
              alt={ad.headline}
              className="ad-feed-card__media"
              onLoad={(e) => {
                const img = e.currentTarget;
                setWide(img.naturalWidth > img.naturalHeight);
              }}
            />
          ) : null}
        </div>
        <div className="ad-feed-card__copy">
          <p className="ad-feed-card__title">{ad.headline || ad.panelTitle}</p>
          {ad.description && <p className="ad-feed-card__desc">{ad.description}</p>}
          <span className="ad-feed-card__cta">{ad.ctaText} →</span>
        </div>
      </button>
      {panelOpen && <AdPanel ad={ad} onClose={() => setPanelOpen(false)} />}
    </>
  );
}
