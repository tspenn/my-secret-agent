import { useState, useRef } from 'react';
import { type Ad, adMediaUrl } from '../lib/ads';
import AdPanel from './AdPanel';

interface AdCardProps {
  ad: Ad;
}

/** 16:9 in-app card — appears below the mission list for free-tier users */
export default function AdCard({ ad }: AdCardProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <>
      <button
        onClick={() => setPanelOpen(true)}
        className="w-full text-left group relative rounded-sm overflow-hidden border border-[#2e2e2e] hover:border-[#444] transition-colors duration-200 bg-[#1e1e1e]"
        aria-label={`Sponsored: ${ad.headline}`}
      >
        {/* 16:9 media */}
        <div className="relative w-full aspect-video overflow-hidden bg-[#232323]">
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
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-mono text-xs text-[#444] tracking-widest uppercase">Sponsored</span>
            </div>
          )}

          {/* Sponsored badge */}
          <span className="absolute top-2 left-2 font-mono text-[9px] tracking-[0.25em] uppercase bg-black/70 text-[#888] px-2 py-0.5 rounded-sm">
            Sponsored
          </span>
        </div>

        {/* Copy row */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[12px] text-[#f5f0e8] truncate">{ad.headline}</p>
            <p className="font-mono text-[11px] text-[#777] truncate mt-0.5">{ad.description}</p>
          </div>
          <span className="font-mono text-[10px] text-amber-400/80 tracking-widest uppercase ml-4 flex-shrink-0 group-hover:text-amber-400 transition-colors">
            {ad.ctaText ?? 'See More'} →
          </span>
        </div>
      </button>

      {panelOpen && <AdPanel ad={ad} onClose={() => setPanelOpen(false)} />}
    </>
  );
}
