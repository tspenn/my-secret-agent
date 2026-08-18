import { type Ad, adMediaUrl } from '../lib/ads';
import AdColumnCard from './AdColumnCard';

interface AdSidebarProps {
  ads: Ad[];
  side: 'left' | 'right';
}

/**
 * Desktop 30% column. Always occupies its grid cell so the brief
 * stays in the center 40%. Cards are 1536×1024 in a 1550×1550 frame.
 */
export default function AdSidebar({ ads, side }: AdSidebarProps) {
  return (
    <aside className="sa-ads" aria-label={`${side} sponsored content`}>
      {ads.map((ad) => (
        <AdColumnCard
          key={ad.id}
          imageUrl={ad.image ? adMediaUrl(ad.image) : ''}
          videoUrl={ad.video ? adMediaUrl(ad.video) : undefined}
          destinationUrl={ad.ctaUrl}
          alt={ad.headline}
          variant="dark"
          caption={ad.overlayTitle}
          subhead={ad.overlayLine}
        />
      ))}
    </aside>
  );
}
