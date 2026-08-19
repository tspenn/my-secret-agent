import { useRef, useState } from 'react';
import { ExternalLink, Volume2, VolumeX } from 'lucide-react';
import { type Ad } from '../lib/ads';

export default function AdDetail({ ad }: { ad: Ad }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);

  return (
    <article id={`ad-detail-${ad.id}`} className="ad-detail">
      {ad.video ? (
        <div className="relative ad-hero ad-hero--video">
          <video
            ref={videoRef}
            src={ad.video}
            poster={ad.image}
            className="ad-hero__video"
            loop
            playsInline
            autoPlay
            muted={muted}
            onPlay={(e) => {
              e.currentTarget.muted = muted;
            }}
          />
          <button
            type="button"
            onClick={() => {
              const next = !muted;
              setMuted(next);
              if (videoRef.current) videoRef.current.muted = next;
            }}
            className="absolute bottom-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 text-white/80 hover:text-white"
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>
      ) : (
        <div className="ad-hero">
          <img src={ad.image} alt="" className="ad-hero__img" />
        </div>
      )}

      <div className="ad-detail__body">
        <p className="ad-detail__kicker">Sponsored · {ad.label}</p>
        <h2 className="ad-detail__title">{ad.panelTitle ?? ad.headline}</h2>
        {(ad.panelParagraphs ?? [ad.description]).map((p) => (
          <p key={p} className="ad-detail__p">{p}</p>
        ))}
        {ad.panelBullets && ad.panelBullets.length > 0 && (
          <ul className="ad-detail__list">
            {ad.panelBullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        )}
        <a
          href={ad.ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ad-detail__cta"
        >
          {ad.ctaText}
          <ExternalLink size={12} />
        </a>
        {ad.panelLinks && ad.panelLinks.length > 0 && (
          <div className="ad-detail__links">
            {ad.panelLinks.map((link) => (
              <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
