'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { submitProductReviewApi, mapReviewToUi } from '@/lib/reviewApi';
import type { Review } from '@/types/ecommerce';

interface ProductWriteReviewFormProps {
  productId: string;
  hasExistingReview?: boolean;
  onSubmitted?: (result: { message: string; review?: Review }) => void;
}

export function ProductWriteReviewForm({
  productId,
  hasExistingReview = false,
  onSubmitted,
}: ProductWriteReviewFormProps) {
  const router = useRouter();
  const { token } = useAuth();
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const activeRating = hoverRating ?? rating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === null || !comment.trim()) return;

    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitProductReviewApi(token, {
        productId,
        rating,
        body: comment.trim(),
      });
      setSuccessMessage(result.message);
      setComment('');
      setRating(null);
      setHoverRating(null);
      onSubmitted?.({
        message: result.message,
        review: mapReviewToUi(result.review),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit review';
      if (/already reviewed/i.test(message)) {
        onSubmitted?.({ message });
      }
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasExistingReview || successMessage) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 sm:p-6 space-y-2">
        <p className="text-sm font-bold text-emerald-800">
          {successMessage || 'You have already reviewed this product.'}
        </p>
        <p className="text-xs text-emerald-700/90 leading-relaxed">
          {successMessage
            ? 'Your review is now visible below.'
            : 'Thank you for sharing your feedback on this item.'}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-[#F4F4F4] p-5 sm:p-6 space-y-4"
    >
      <div>
        <p className="text-xs font-bold uppercase text-gray-700 mb-2">Your Rating</p>
        <div
          className="flex items-center gap-1"
          onMouseLeave={() => setHoverRating(null)}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              className="p-0.5 cursor-pointer focus:outline-none"
              aria-label={`Rate ${star} stars`}
              aria-pressed={rating === star}
            >
              <Star
                className={`h-7 w-7 transition-colors ${
                  activeRating !== null && star <= activeRating
                    ? 'fill-[#FFC633] text-[#FFC633]'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          {rating === null
            ? 'Tap a star to rate this product (1 to 5).'
            : `You selected ${rating} out of 5 stars.`}
        </p>
      </div>

      <div>
        <label
          htmlFor="review-detail"
          className="text-xs font-bold uppercase text-gray-700 block mb-2"
        >
          Review Detail
        </label>
        <textarea
          id="review-detail"
          rows={4}
          placeholder="Share your thoughts about the design, fabric quality, and fit..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          minLength={3}
          className="w-full rounded-2xl border border-transparent bg-white px-4 py-3 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10"
        />
      </div>

      {error && (
        <p className="text-xs font-semibold text-rose-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || rating === null || !comment.trim()}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-xs font-bold uppercase text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {token ? 'Submit Review' : 'Sign In to Submit'}
      </button>
    </form>
  );
}
