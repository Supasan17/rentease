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
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500';

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
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-4" noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="search" className="sr-only">
          Search items
        </label>
        <input
          id="search"
          name="search"
          type="search"
          placeholder="Search drills, tents, speakers..."
          maxLength={100}
          value={draft.search || ''}
          onChange={handleChange}
          className={inputClass}
        />
        <button
          type="submit"
          className="rounded-md bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Search
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-5">
        <div>
          <label htmlFor="category" className="block text-xs font-medium text-gray-600">
            Category
          </label>
          <select id="category" name="category" value={draft.category || ''} onChange={handleSelect} className={`${inputClass} mt-1 capitalize`}>
            <option value="">All categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

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

        <div className="col-span-2 md:col-span-1">
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
