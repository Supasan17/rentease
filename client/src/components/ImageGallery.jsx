/**
 * Image Gallery Component
 *
 * Large main image with a row of thumbnails underneath. Clicking a
 * thumbnail (or using the previous / next arrows) changes the main image.
 */

import { useState } from 'react';
import { getImageUrl } from '../utils/items.js';

const arrowClass =
  'absolute top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-3 py-1 text-lg font-bold text-gray-800 shadow hover:bg-white';

function ImageGallery({ images = [], title }) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-gray-100 text-gray-400">
        No images for this item
      </div>
    );
  }

  const current = Math.min(index, images.length - 1);
  const show = (next) => setIndex((next + images.length) % images.length);

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
        <img
          src={getImageUrl(images[current])}
          alt={`${title} - image ${current + 1} of ${images.length}`}
          className="h-full w-full object-cover"
        />
        {images.length > 1 && (
          <>
            <button type="button" className={`${arrowClass} left-2`} onClick={() => show(current - 1)} aria-label="Previous image">
              ‹
            </button>
            <button type="button" className={`${arrowClass} right-2`} onClick={() => show(current + 1)} aria-label="Next image">
              ›
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((image, i) => (
            <button
              key={image}
              type="button"
              onClick={() => setIndex(i)}
              className={`aspect-square overflow-hidden rounded-md border-2 ${
                i === current ? 'border-emerald-600' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === current}
            >
              <img src={getImageUrl(image)} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageGallery;
