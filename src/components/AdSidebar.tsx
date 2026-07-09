import { useState, useRef } from 'react';
import { type Ad, adMediaUrl } from '../lib/ads';
import AdPanel from './AdPanel';

interface AdSidebarItemProps {
  ad: Ad;
}

function AdSidebarItem({ ad }: AdSidebarItemProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <>
      <button
        onClick={() => setPanelOpen(true)}
        className="w-full text-left group relative rounded-sm overflow-hidden border border-[#2e2e2e] hover:border-[#444] transition-colors duration-200 bg-[#1e1e1e]"
        aria-label={`Sponsored: ${ad.headline}`}
      >
        {/* Square media — fills full column width */}
        <div className="relative w-full aspect-square overflow-hidden bg-[#232323]">
          {ad.video ? (
            <video
              ref={videoRef}
              src={adMediaUrl(ad.video)}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : ad.image ? (
            <img
              src={adMediaUrl(ad.image)}
              alt={ad.headline}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
          ) : null}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-[#2e2e2e]">
          <span className="font-mono text-[9px] text-[#666] tracking-widest uppercase">Sponsored</span>
          <span className="font-mono text-[9px] text-amber-400/70 group-hover:text-amber-400 transition-colors tracking-widest uppercase">
            See More →
          </span>
        </div>
      </button>

      {panelOpen && <AdPanel ad={ad} onClose={() => setPanelOpen(false)} />}
    </>
  );
}

interface AdSidebarProps {
  ads: Ad[];
  side: 'left' | 'right';
}

/**
 * Desktop-only sidebar column (hidden on mobile).
 * Width: 33% of container, min 200px, max 420px.
 * Only renders ads that have image or video media.
 * Right sidebar shows ads in reverse order.
 */
export default function AdSidebar({ ads, side }: AdSidebarProps) {
  const mediaAds = ads.filter((a) => a.image || a.video);
  const ordered = side === 'right' ? [...mediaAds].reverse() : mediaAds;

  if (ordered.length === 0) return null;

  return (
    <aside
      className="hidden lg:flex flex-col gap-4 flex-shrink-0"
      style={{ width: 'clamp(200px, 33%, 420px)' }}
      aria-label={`${side} sponsored content`}
    >
      {ordered.map((ad) => (
        <AdSidebarItem key={ad.id} ad={ad} />
      ))}
    </aside>
  );
}
