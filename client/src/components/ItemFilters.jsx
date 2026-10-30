/**
 * Item Filters Component
 *
 * Search box plus category, price range, city and sort controls for the
 * browse page. Text fields are applied when the form is submitted; the
 * category and sort dropdowns apply as soon as they change.
 */

import { useEffect, useState } from 'react';
import { CATEGORIES, SORT_OPTIONS } from '../utils/items.js';

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15';

const TEXT_FIELDS = ['search', 'minPrice', 'maxPrice', 'city'];

/**
 * @param {Object}   filters  - Current filter values (strings) from the URL
 * @param {Function} onChange - Called with the new filter values to apply
 */
function ItemFilters({ filters, onChange }) {
  const [draft, setDraft] = useState(filters);
  const [error, setError] = useState('');

  // Keep the form in step when the URL changes (back button, clear filters)
  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSelect = (e) => {
    const { name, value } = e.target;
    onChange({ ...draft, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const min = parseFloat(draft.minPrice);
    const max = parseFloat(draft.maxPrice);
    if (!Number.isNaN(min) && !Number.isNaN(max) && max < min) {
      setError('Max price cannot be less than min price');
      return;
    }
    onChange(draft);
  };

  const handleClear = () => {
    setError('');
    onChange({});
  };

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <form onSubmit={handleSubmit} className="card p-4 sm:p-5" noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="search" className="sr-only">
          Search items
        </label>
        <div className="relative flex-1">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m20 20-3.500-3.500" />
          </svg>
          <input
            id="search"
            name="search"
            type="search"
            placeholder="Search drills, tents, speakers..."
            maxLength={100}
            value={draft.search || ''}
            onChange={handleChange}
            className={`${inputClass} pl-9`}
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Search
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Category">
        {['', ...CATEGORIES].map((category) => {
          const active = (draft.category || '') === category;
          return (
            <button
              key={category || 'all'}
              type="button"
              aria-pressed={active}
              onClick={() => onChange({ ...draft, category })}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium capitalize transition ${
                active
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-400 hover:text-emerald-700'
              }`}
            >
              {category || 'All'}
            </button>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div>
          <label htmlFor="minPrice" className="block text-xs font-medium text-gray-600">
            Min price / day
          </label>
          <input id="minPrice" name="minPrice" type="number" min="0" value={draft.minPrice || ''} onChange={handleChange} className={`${inputClass} mt-1`} />
        </div>

        <div>
          <label htmlFor="maxPrice" className="block text-xs font-medium text-gray-600">
            Max price / day
          </label>
          <input id="maxPrice" name="maxPrice" type="number" min="0" value={draft.maxPrice || ''} onChange={handleChange} className={`${inputClass} mt-1`} />
        </div>

        <div>
          <label htmlFor="city" className="block text-xs font-medium text-gray-600">
            City
          </label>
          <input id="city" name="city" type="text" placeholder="Any city" value={draft.city || ''} onChange={handleChange} className={`${inputClass} mt-1`} />
        </div>

        <div>
          <label htmlFor="sort" className="block text-xs font-medium text-gray-600">
            Sort by
          </label>
          <select id="sort" name="sort" value={draft.sort || 'newest'} onChange={handleSelect} className={`${inputClass} mt-1`}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-sm">
        {error ? <p className="text-red-600">{error}</p> : <span />}
        <div className="flex gap-3">
          {TEXT_FIELDS.some((field) => (draft[field] || '') !== (filters[field] || '')) && (
            <button type="submit" className="font-medium text-emerald-600 hover:underline">
              Apply filters
            </button>
          )}
          {hasFilters && (
            <button type="button" onClick={handleClear} className="font-medium text-gray-600 hover:underline">
              Clear all
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

export default ItemFilters;
