/**
 * Item Detail Page
 *
 * Shows one item from GET /api/items/:id: an image gallery, price and
 * deposit, condition, location, owner and description, followed by its
 * reviews from GET /api/items/:id/reviews. Renters can book the item for
 * a date range, and the item's owner (or an admin) also sees an edit button.
 */

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios.js';
import Spinner from '../components/Spinner.jsx';
import BookingForm from '../components/BookingForm.jsx';
import ImageGallery from '../components/ImageGallery.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import StarRating from '../components/StarRating.jsx';
import { formatPrice } from '../utils/items.js';

const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

/**
 * One label / value row in the item facts list.
 */
function Fact({ label, children }) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="mt-0.5 font-medium capitalize text-gray-900">{children}</dd>
    </div>
  );
}

function Reviews({ reviews, averageRating, numReviews }) {
  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 className="text-xl font-semibold">Reviews</h2>
        {numReviews > 0 && (
          <p className="flex items-center gap-2 text-sm text-gray-600">
            <StarRating rating={averageRating} />
            <span>
              {averageRating.toFixed(1)} out of 5 · {numReviews} review{numReviews === 1 ? '' : 's'}
            </span>
          </p>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-gray-300 bg-white px-6 py-8 text-center text-sm text-gray-600">
          No reviews yet. Renters can review this item after they return it.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {reviews.map((review) => (
            <li key={review._id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-gray-900">{review.reviewer?.name || 'Former renter'}</p>
                <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
              </div>
              <StarRating rating={review.rating} className="mt-1" />
              {review.comment && <p className="mt-2 whitespace-pre-line text-gray-700">{review.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [reviewData, setReviewData] = useState({ reviews: [], averageRating: 0, numReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    const fetchItem = async () => {
      setLoading(true);
      setError('');
      try {
        const [itemRes, reviewRes] = await Promise.all([
          api.get(`/items/${id}`),
          api.get(`/items/${id}/reviews`),
        ]);
        if (!ignore) {
          setItem(itemRes.data.item);
          setReviewData(reviewRes.data);
        }
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err));
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchItem();
    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return <Spinner label="Loading item..." />;
  }

  if (error) {
    return (
      <section className="py-12 text-center">
        <h1 className="text-2xl font-bold">Item unavailable</h1>
        <p className="mt-2 text-gray-600">{error}</p>
        <Link to="/" className="mt-6 inline-block font-medium text-emerald-600 hover:underline">
          Back to browsing
        </Link>
      </section>
    );
  }

  const canEdit = user && (user.role === 'admin' || item.owner?._id === user._id);

  return (
    <article>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="text-sm font-medium text-emerald-600 hover:underline">
          ← Back to browsing
        </Link>
        {canEdit && (
          <Link
            to={`/items/${item._id}/edit`}
            className="rounded-md border border-emerald-600 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
          >
            Edit item
          </Link>
        )}
      </div>

      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <ImageGallery images={item.images} title={item.title} />

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-600">{item.category}</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">{item.title}</h1>

          <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
            {item.numReviews > 0 ? (
              <>
                <StarRating rating={item.averageRating} />
                <span>
                  {item.averageRating.toFixed(1)} ({item.numReviews} review{item.numReviews === 1 ? '' : 's'})
                </span>
              </>
            ) : (
              'No reviews yet'
            )}
          </p>

          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
            <p>
              <span className="text-3xl font-bold text-gray-900">{formatPrice(item.pricePerDay)}</span>
              <span className="text-gray-500"> / day</span>
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Refundable deposit: <span className="font-medium text-gray-900">{formatPrice(item.deposit)}</span>
            </p>
            <p
              className={`mt-4 inline-block rounded-full px-3 py-1 text-sm font-medium ${
                item.isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {item.isAvailable ? 'Available to rent' : 'Not available right now'}
            </p>
            <BookingForm item={item} />
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <Fact label="Condition">{item.condition?.replace('-', ' ')}</Fact>
            <Fact label="Location">
              {[item.location?.address, item.location?.city].filter(Boolean).join(', ')}
            </Fact>
            <Fact label="Owner">{item.owner?.name || 'Unknown'}</Fact>
            <Fact label="Listed">{formatDate(item.createdAt)}</Fact>
          </dl>

          <div className="mt-6">
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="mt-2 whitespace-pre-line text-gray-700">{item.description}</p>
          </div>
        </div>
      </div>

      <Reviews
        reviews={reviewData.reviews}
        averageRating={reviewData.averageRating}
        numReviews={reviewData.numReviews}
      />
    </article>
  );
}

export default ItemDetail;
