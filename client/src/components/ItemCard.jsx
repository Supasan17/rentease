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
      className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-gray-100">
        {image ? (
          <img
            src={getImageUrl(image)}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">No image</div>
        )}
        {!item.isAvailable && (
          <span className="absolute left-2 top-2 rounded-full bg-gray-900/75 px-2 py-0.5 text-xs font-medium text-white">
            Unavailable
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">{item.category}</p>
        <h3 className="mt-1 line-clamp-2 font-semibold text-gray-900 group-hover:text-emerald-700">
          {item.title}
        </h3>
        <p className="mt-1 text-sm text-gray-500">{item.location?.city}</p>

        <div className="mt-auto flex items-end justify-between pt-3">
          <p>
            <span className="font-bold text-gray-900">{formatPrice(item.pricePerDay)}</span>
            <span className="text-sm text-gray-500"> / day</span>
          </p>
          <p className="text-sm text-gray-600">
            {item.numReviews > 0 ? (
              <>
                <span className="text-amber-500">★</span> {item.averageRating.toFixed(1)}{' '}
                <span className="text-gray-400">({item.numReviews})</span>
              </>
            ) : (
              <span className="text-gray-400">No reviews</span>
            )}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default ItemCard;
