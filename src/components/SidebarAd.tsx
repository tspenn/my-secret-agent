import { useState, useRef } from 'react';
import { type Ad, adMediaUrl } from '../lib/ads';
import AdPanel from './AdPanel';

interface SidebarAdProps {
  ad: Ad;
}

/** Desktop sidebar unit — 1:1, object-cover. */
export default function SidebarAd({ ad }: SidebarAdProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const still = ad.imageWide ?? ad.image ?? ad.imagePortrait;

  return (
    <>
      <button
        type="button"
        onClick={() => setPanelOpen(true)}
        className="sidebar-ad group"
        aria-label={ad.headline || ad.panelTitle || ad.label}
      >
        <div className="sidebar-ad__frame">
          {ad.video ? (
            <video
              ref={videoRef}
              src={adMediaUrl(ad.video)}
              poster={still ? adMediaUrl(still) : undefined}
              className="sidebar-ad__media"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : still ? (
            <img src={adMediaUrl(still)} alt={ad.headline} className="sidebar-ad__media" />
          ) : null}
          {(ad.overlayTitle || ad.overlayLine) && (
            <span className="ad-column-card__caption">
              {ad.overlayTitle && <span className="ad-column-card__caption-title">{ad.overlayTitle}</span>}
              {ad.overlayLine && <span className="ad-column-card__caption-sub">{ad.overlayLine}</span>}
            </span>
          )}
        </div>
      </button>
      {panelOpen && <AdPanel ad={ad} onClose={() => setPanelOpen(false)} />}
    </>
  );
}
