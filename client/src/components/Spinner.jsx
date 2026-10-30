/**
 * Spinner Component
 *
 * Centered loading indicator with a short label for pages fetching data.
 */

function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-sm text-gray-600" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-emerald-600" aria-hidden="true" />
      {label}
    </div>
  );
}

export default Spinner;
