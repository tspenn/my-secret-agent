export type AdColumnCardVariant = 'light' | 'dark' | 'default';

export interface AdColumnCardProps {
  /** Ad image URL (prefer 1536 × 1024). */
  imageUrl: string;
  /** Click destination for the entire card. */
  destinationUrl: string;
  /** Alt text for the image. */
  alt: string;
  /** Optional border / shadow treatment. */
  variant?: AdColumnCardVariant;
  /** Optional looping video instead of the still image. */
  videoUrl?: string;
  /** Optional title drawn over the bottom of the card. */
  caption?: string;
  /** Optional line under the caption. */
  subhead?: string;
}

/**
 * Side-column ad card.
 *
 * Design frame is 1550 × 1550. The clickable card is 1536 × 1024,
 * centered (7px left/right, 263px top/bottom). The frame scales to
 * the column on desktop; on smaller screens the 3:2 card is full width.
 */
export default function AdColumnCard({
  imageUrl,
  destinationUrl,
  alt,
  variant = 'default',
  videoUrl,
  caption,
  subhead,
}: AdColumnCardProps) {
  return (
    <div className="ad-column-slot">
      <a
        href={destinationUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`ad-column-card ad-column-card--${variant}`}
        aria-label={alt}
      >
        {videoUrl ? (
          <video
            src={videoUrl}
            className="ad-column-card__media"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img src={imageUrl} alt={alt} className="ad-column-card__media" />
        )}
        {(caption || subhead) && (
          <span className="ad-column-card__caption">
            {caption && <span className="ad-column-card__caption-title">{caption}</span>}
            {subhead && <span className="ad-column-card__caption-sub">{subhead}</span>}
          </span>
        )}
      </a>
    </div>
  );
}
