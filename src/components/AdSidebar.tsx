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
        {/* Square media — fills the 30% column */}
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
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center px-4 text-center gap-2">
              <span className="font-mono text-[10px] text-[#555] tracking-widest uppercase">Sponsored</span>
              <p className="font-mono text-[13px] text-[#c8c0b0] leading-snug">{ad.headline}</p>
            </div>
          )}
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
 * Desktop-only 30% column. Always occupies its grid cell so the brief
 * stays in the center 40%. Right sidebar reverses ad order.
 */
export default function AdSidebar({ ads, side }: AdSidebarProps) {
  const ordered = side === 'right' ? [...ads].reverse() : ads;

  return (
    <aside className="sa-ads" aria-label={`${side} sponsored content`}>
      {ordered.map((ad) => (
        <AdSidebarItem key={ad.id} ad={ad} />
      ))}
    </aside>
  );
}
