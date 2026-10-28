/**
 * Star Rating Component
 *
 * Read-only row of five stars for a 0-5 rating. Partial stars are filled
 * proportionally, so 4.5 shows four and a half stars.
 */

function Star({ fill }) {
  return (
    <span className="relative inline-block text-gray-300" aria-hidden="true">
      ★
      <span className="absolute inset-0 overflow-hidden text-amber-500" style={{ width: `${fill * 100}%` }}>
        ★
      </span>
    </span>
  );
}

function StarRating({ rating = 0, className = '' }) {
  return (
    <span className={`inline-flex leading-none ${className}`} role="img" aria-label={`Rated ${rating} out of 5`}>
      {[0, 1, 2, 3, 4].map((index) => (
        <Star key={index} fill={Math.min(Math.max(rating - index, 0), 1)} />
      ))}
    </span>
  );
}

export default StarRating;
