import { type Ad } from '../lib/ads';
import SidebarAd from './SidebarAd';
import ProductAdCard from './ProductAdCard';

interface AdSidebarProps {
  ads: Ad[];
  side: 'left' | 'right';
}

/** Desktop 30% column. Stacks every media unit with a 1:1 spacer between. */
export default function AdSidebar({ ads, side }: AdSidebarProps) {
  return (
    <aside className="sa-ads" aria-label={`${side} sponsored content`}>
      {ads.map((ad, i) => (
        <div key={ad.id}>
          {i > 0 && <div className="ad-sidebar-spacer" aria-hidden />}
          {ad.layout === 'product' ? (
            <ProductAdCard ad={ad} variant="square" />
          ) : (
            <SidebarAd ad={ad} />
          )}
        </div>
      ))}
    </aside>
  );
}
