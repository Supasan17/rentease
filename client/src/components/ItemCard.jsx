/**
 * Item Card Component
 *
 * Compact summary of an item for the browse grid: first image, title,
 * category, city, price per day, rating and availability. Links to the
 * item's detail page.
 */

import { Link } from 'react-router-dom';
import { formatPrice, getImageUrl } from '../utils/items.js';

function ItemCard({ item }) {
  const image = item.images?.[0];

  return (
    <Link
      to={`/items/${item._id}`}
      className="card group flex animate-rise flex-col overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-900/10"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {image ? (
          <img
            src={getImageUrl(image)}
            alt={item.title}
            loading="lazy"
            className="h-full w-full bg-white object-contain p-2 transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">No image</div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold capitalize text-gray-800 shadow-sm backdrop-blur">
          {item.category}
        </span>
        {!item.isAvailable && (
          <span className="absolute right-3 top-3 rounded-full bg-gray-900/80 px-2.5 py-1 text-xs font-semibold text-white">
            Unavailable
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-semibold text-gray-900 group-hover:text-emerald-700">{item.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.800 12 21 12 21Z" />
            <circle cx="12" cy="9.500" r="2.500" />
          </svg>
          {item.location?.city}
        </p>

        <div className="mt-auto flex items-end justify-between pt-4">
          <p>
            <span className="text-lg font-bold text-gray-900">{formatPrice(item.pricePerDay)}</span>
            <span className="text-sm text-gray-500"> / day</span>
          </p>
          <p className="text-sm text-gray-600">
            {item.numReviews > 0 ? (
              <>
                <span className="text-amber-500">★</span> {item.averageRating.toFixed(1)}{' '}
                <span className="text-gray-400">({item.numReviews})</span>
              </>
            ) : (
              <span className="text-xs text-gray-400">New</span>
            )}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default ItemCard;
