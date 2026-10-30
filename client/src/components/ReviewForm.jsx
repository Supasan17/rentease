/**
 * Review Form
 *
 * Lets a renter rate a returned rental from 1 to 5 stars and add an optional
 * comment, then sends it to POST /api/reviews.
 */

import { useState } from 'react';
import api, { getErrorMessage } from '../api/axios.js';

const MAX_COMMENT_LENGTH = 1000;

function ReviewForm({ rentalId, onReviewed }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating) {
      setError('Please choose a rating');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await api.post('/reviews', {
        rental: rentalId,
        rating,
        comment: comment.trim() || undefined,
      });
      onReviewed();
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-4 rounded-md bg-gray-50 p-4">
      <h3 className="text-sm font-semibold text-gray-900">Review this item</h3>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-2 flex gap-1" role="group" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setRating(value);
              setError('');
            }}
            aria-label={`${value} star${value === 1 ? '' : 's'}`}
            aria-pressed={rating === value}
            className={`text-2xl leading-none ${value <= rating ? 'text-amber-500' : 'text-gray-300 hover:text-amber-300'}`}
          >
            ★
          </button>
        ))}
      </div>

      <label className="mt-3 block text-sm font-medium text-gray-700">
        Comment <span className="font-normal text-gray-500">(optional)</span>
        <textarea
          rows={2}
          maxLength={MAX_COMMENT_LENGTH}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="mt-3 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {submitting ? 'Sending...' : 'Submit review'}
      </button>
    </form>
  );
}

export default ReviewForm;
