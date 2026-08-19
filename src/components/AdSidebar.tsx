import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { type Ad } from '../lib/ads';
import SidebarAd from './SidebarAd';
import AdDetail from './AdDetail';

interface AdSidebarProps {
  ads: Ad[];
  side: 'left' | 'right';
  openId: string | null;
  onOpen: (adId: string) => void;
  onClose: () => void;
}

export default function AdSidebar({ ads, side, openId, onOpen, onClose }: AdSidebarProps) {
  const scrollerRef = useRef<HTMLElement>(null);
  const open = openId !== null;

  useEffect(() => {
    if (!openId || !scrollerRef.current) return;
    const node = document.getElementById(`ad-detail-${openId}`);
    if (!node || !scrollerRef.current.contains(node)) return;
    scrollerRef.current.scrollTop = node.offsetTop;
  }, [openId]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <aside
      ref={scrollerRef}
      className={`sa-ads ${open ? 'sa-ads--panel' : ''} ${side === 'left' ? 'sa-ads--left' : 'sa-ads--right'}`}
      aria-label={open ? `${side} sponsored details` : `${side} sponsored content`}
    >
      {open ? (
        <>
          <div className="sa-ads-panel-bar">
            <span>Sponsored</span>
            <button type="button" onClick={onClose} aria-label="Close">
              <X size={15} />
            </button>
          </div>
          {ads.map((ad) => (
            <AdDetail key={ad.id} ad={ad} />
          ))}
        </>
      ) : (
        ads.map((ad) => (
          <SidebarAd key={ad.id} ad={ad} onOpen={() => onOpen(ad.id)} />
        ))
      )}
    </aside>
  );
}
