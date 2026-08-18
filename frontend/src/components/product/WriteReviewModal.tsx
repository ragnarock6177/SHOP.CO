'use client';

import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { Review } from '../../types/ecommerce';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (review: Review) => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmitReview,
}) => {
  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !comment.trim()) return;

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      userName: userName.trim(),
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      rating,
      comment: comment.trim(),
      date: `Posted on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
      verified: true,
    };

    onSubmitReview(newReview);
    onClose();
    setUserName('');
    setComment('');
    setRating(5);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Modal Dialog Card */}
      <div
        className={`relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl z-10 text-black transition-all duration-300 transform ${
          isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h3 className="font-be-vietnam-pro-black text-xl font-black">Write a Review</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-gray-700 block mb-1">
              Rating
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating ? 'fill-[#FFC633] text-[#FFC633]' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-gray-700 block mb-1">
              Your Name
            </label>
            <input
              type="text"
              placeholder="e.g. Samantha D."
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              className="w-full bg-[#F0F0F0] rounded-2xl px-4 py-3 text-sm text-black placeholder-gray-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-gray-700 block mb-1">
              Review Detail
            </label>
            <textarea
              rows={4}
              placeholder="Share your thoughts about the design, fabric quality, and fit..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              className="w-full bg-[#F0F0F0] rounded-2xl p-4 text-sm text-black placeholder-gray-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-black hover:bg-gray-800 text-white font-bold text-sm rounded-full transition-all shadow-md"
          >
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
};
