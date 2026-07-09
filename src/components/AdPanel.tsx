import { useEffect, useRef } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { type Ad, adMediaUrl } from '../lib/ads';

interface AdPanelProps {
  ad: Ad;
  onClose: () => void;
}

export default function AdPanel({ ad, onClose }: AdPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel — slides in from right */}
      <div
        className="relative flex flex-col bg-[#1a1a1a] border-l border-[#2e2e2e] shadow-2xl overflow-y-auto animate-slide-in-right"
        style={{ width: 'min(92vw, 680px)' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white/60 hover:text-white hover:bg-black/80 transition-colors"
          aria-label="Close"
        >
          <X size={15} />
        </button>

        {/* Media */}
        {ad.video ? (
          <video
            ref={videoRef}
            src={adMediaUrl(ad.video)}
            className="w-full aspect-video object-cover"
            loop
            playsInline
            controls
          />
        ) : ad.image ? (
          <img
            src={adMediaUrl(ad.image)}
            alt={ad.headline}
            className="w-full aspect-video object-cover"
          />
        ) : (
          <div className="w-full aspect-video bg-[#232323] flex items-center justify-center">
            <span className="font-mono text-xs text-[#555] tracking-widest uppercase">Sponsored</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 px-8 py-8">
          <p className="font-mono text-[10px] text-amber-500/50 tracking-[0.3em] uppercase mb-3">
            {ad.label ?? 'Sponsored'}
          </p>

          <h2 className="text-2xl font-semibold text-[#f5f0e8] mb-4 leading-snug">
            {ad.panelTitle ?? ad.headline}
          </h2>

          {(ad.panelParagraphs ?? [ad.description]).map((p, i) => (
            <p key={i} className="text-[#a0a0a0] text-sm leading-relaxed mb-4">
              {p}
            </p>
          ))}

          {ad.panelBullets && ad.panelBullets.length > 0 && (
            <ul className="mb-6 space-y-2">
              {ad.panelBullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#c8c0b0]">
                  <span className="text-amber-500 mt-0.5 flex-shrink-0">✓</span>
                  {b}
                </li>
              ))}
            </ul>
          )}

          {/* Primary CTA */}
          <a
            href={ad.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-widest bg-amber-500 hover:bg-amber-400 text-[#1a1a1a] font-semibold px-5 py-2.5 rounded-sm transition-colors duration-150"
          >
            {ad.ctaText ?? 'See More'}
            <ExternalLink size={12} />
          </a>

          {/* Secondary links */}
          {ad.panelLinks && ad.panelLinks.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-4">
              {ad.panelLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] text-[#8a8a8a] hover:text-amber-400 transition-colors underline underline-offset-2"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
