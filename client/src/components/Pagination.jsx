/**
 * Pagination Component
 *
 * Previous / next buttons with numbered pages around the current one.
 * Renders nothing when there is only one page.
 */

const buttonClass =
  'min-w-9 rounded-md border px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50';

/**
 * Page numbers to show: the first, the last, and two either side of the
 * current page, with null marking a gap.
 */
const getPageNumbers = (page, pages) => {
  const numbers = [];
  for (let n = 1; n <= pages; n += 1) {
    if (n === 1 || n === pages || Math.abs(n - page) <= 2) {
      numbers.push(n);
    } else if (numbers[numbers.length - 1] !== null) {
      numbers.push(null);
    }
  }
  return numbers;
};

function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      <button
        type="button"
        className={`${buttonClass} border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Previous
      </button>

      {getPageNumbers(page, pages).map((n, index) =>
        n === null ? (
          <span key={`gap-${index}`} className="px-1 text-gray-400">
            …
          </span>
        ) : (
          <button
            key={n}
            type="button"
            className={`${buttonClass} ${
              n === page
                ? 'border-emerald-600 bg-emerald-600 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
            aria-current={n === page ? 'page' : undefined}
            onClick={() => onChange(n)}
          >
            {n}
          </button>
        )
      )}

      <button
        type="button"
        className={`${buttonClass} border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}

export default Pagination;
