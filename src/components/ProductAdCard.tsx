import { type Ad, adMediaUrl } from '../lib/ads';

export type ProductAdVariant = 'portrait' | 'landscape' | 'square' | 'banner';

interface ProductAdCardProps {
  ad: Ad;
  variant: ProductAdVariant;
}

const FRAME: Record<ProductAdVariant, string> = {
  portrait: 'product-ad--portrait',
  landscape: 'product-ad--landscape',
  square: 'product-ad--square',
  banner: 'product-ad--banner',
};

/** Outbound product unit. No detail panel. */
export default function ProductAdCard({ ad, variant }: ProductAdCardProps) {
  const still =
    variant === 'portrait'
      ? ad.imagePortrait ?? ad.image ?? ad.imageWide
      : ad.imageWide ?? ad.image ?? ad.imagePortrait;

  return (
    <a
      href={ad.ctaUrl}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className={`product-ad ${FRAME[variant]}`}
      aria-label={ad.headline}
    >
      <div className="product-ad__frame">
        {still && <img src={adMediaUrl(still)} alt={ad.headline} className="product-ad__media" />}
      </div>
      {variant !== 'banner' && (
        <div className="product-ad__copy">
          {ad.brand && <p className="product-ad__brand">{ad.brand}</p>}
          <p className="product-ad__title">{ad.headline}</p>
          <p className="product-ad__meta">
            {[ad.price, ad.sizeLabel].filter(Boolean).join(' · ')}
          </p>
        </div>
      )}
    </a>
  );
}
