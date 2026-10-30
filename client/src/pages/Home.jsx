/**
 * Home Page (Browse Items)
 *
 * Lists items from GET /api/items with search, category, price, city and
 * sort filters plus pagination. Filters live in the URL query string, so a
 * filtered page can be shared, bookmarked or reached with the back button.
 */

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios.js';
import ItemCard from '../components/ItemCard.jsx';
import ItemFilters from '../components/ItemFilters.jsx';
import Pagination from '../components/Pagination.jsx';
import { getImageUrl } from '../utils/items.js';

const FILTER_KEYS = ['search', 'category', 'minPrice', 'maxPrice', 'city', 'sort'];
const PAGE_SIZE = 12;
const HERO_IMAGE_COUNT = 4;

function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [result, setResult] = useState({ items: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const queryString = searchParams.toString();

  // Filter values from the URL, rebuilt only when the query string changes
  const filters = useMemo(() => {
    const values = {};
    FILTER_KEYS.forEach((key) => {
      const value = searchParams.get(key);
      if (value) values[key] = value;
    });
    return values;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  const page = Math.max(parseInt(searchParams.get('page'), 10) || 1, 1);

  useEffect(() => {
    let ignore = false;

    const fetchItems = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/items', {
          params: { ...filters, page, limit: PAGE_SIZE },
        });
        if (!ignore) setResult(data);
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err));
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchItems();
    return () => {
      ignore = true;
    };
  }, [filters, page]);

  // Applying new filters always goes back to page 1
  const handleFilterChange = (values) => {
    const params = {};
    FILTER_KEYS.forEach((key) => {
      const value = values[key]?.toString().trim();
      if (value && !(key === 'sort' && value === 'newest')) params[key] = value;
    });
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasFilters = Object.keys(filters).some((key) => key !== 'sort');
  const heroImages = result.items.map((item) => item.images?.[0]).filter(Boolean).slice(0, HERO_IMAGE_COUNT);

  return (
    <section>
      {!hasFilters && page === 1 && (
        <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 p-8 text-white sm:p-10 lg:grid lg:grid-cols-[1fr_22rem] lg:items-center lg:gap-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-300">Household item rentals</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">Rent what you need, near you</h1>
            <p className="mt-4 max-w-xl text-lg text-emerald-50/90">
              Browse household items from local owners, or earn from the things you already own.
            </p>
          </div>

          {heroImages.length === HERO_IMAGE_COUNT && (
            <div className="mt-8 hidden grid-cols-2 gap-3 lg:mt-0 lg:grid" aria-hidden="true">
              {heroImages.map((image, index) => (
                <img
                  key={image}
                  src={getImageUrl(image)}
                  alt=""
                  className={`aspect-square w-full rounded-2xl object-cover shadow-lg ${index % 2 ? 'translate-y-3' : '-translate-y-3'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {(hasFilters || page > 1) && <h1 className="mb-4 text-2xl font-bold text-gray-900">Browse items</h1>}

      <ItemFilters filters={filters} onChange={handleFilterChange} />

      {error ? (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-gray-600" aria-live="polite">
            {loading
              ? 'Loading items...'
              : `${result.total} item${result.total === 1 ? '' : 's'} found`}
          </p>

          {!loading && result.items.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
              <p className="font-medium text-gray-900">No items found</p>
              <p className="mt-1 text-sm text-gray-600">
                {hasFilters ? 'Try changing or clearing your filters.' : 'No one has listed an item yet.'}
              </p>
            </div>
          ) : (
            <div className={`mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${loading ? 'opacity-60' : ''}`}>
              {result.items.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          )}

          <Pagination page={result.page} pages={result.pages} onChange={handlePageChange} />
        </>
      )}
    </section>
  );
}

export default Home;
