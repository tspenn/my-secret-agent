import { type Ad } from '../lib/ads';
import SidebarAd from './SidebarAd';

interface AdSidebarProps {
  ads: Ad[];
  side: 'left' | 'right';
}

export default function AdSidebar({ ads, side }: AdSidebarProps) {
  return (
    <aside className="sa-ads" aria-label={`${side} sponsored content`}>
      {ads.map((ad) => (
        <SidebarAd key={ad.id} ad={ad} />
      ))}
    </aside>
  );
}
