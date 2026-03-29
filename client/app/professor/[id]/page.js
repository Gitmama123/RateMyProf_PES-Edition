"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { fetchProfessor, fetchReviews } from "../../../lib/api";
import StarRating from "../../../components/StarRating";
import RatingBreakdown from "../../../components/RatingBreakdown";
import ReviewCard from "../../../components/ReviewCard";
import AddReviewForm from "../../../components/AddReviewForm";
import { isAuthenticated } from "../../../lib/auth";

export default function ProfessorDetailPage({ params }) {
  // Unwrap the params promise (Next.js 15 requires this)
  const { id } = use(params);

  const [professor, setProfessor] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prof, revData] = await Promise.all([
        fetchProfessor(id),
        fetchReviews(id),
      ]);
      setProfessor(prof);
      setReviewData(revData);
    } catch (err) {
      setError("Failed to load professor data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleReviewAdded = () => {
    // Reload data after new review is submitted
    loadData();
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !professor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-lg text-red-400 mb-4">{error || "Professor not found"}</p>
        <Link
          href="/"
          className="text-indigo-400 hover:text-indigo-300 text-sm underline"
        >
          ← Back to all professors
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-400 transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to all professors
      </Link>

      {/* Professor header */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-indigo-500/25">
            {professor.name.charAt(0)}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {professor.name}
            </h1>
            <p className="text-gray-400 mb-3">
              {professor.department}{professor.campus && professor.campus !== "Unknown" ? `, ${professor.campus}` : ""}
            </p>

            {/* Rating summary */}
            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={professor.averageRating} size="text-xl" />
              <span className="text-2xl font-bold text-white">
                {professor.averageRating > 0
                  ? professor.averageRating.toFixed(1)
                  : "–"}
              </span>
              <span className="text-sm text-gray-500">
                ({professor.totalReviews}{" "}
                {professor.totalReviews === 1 ? "review" : "reviews"})
              </span>
            </div>

            {/* Subjects */}
            {professor.subjects && professor.subjects.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {professor.subjects.map((subj) => (
                  <span
                    key={subj}
                    className="text-xs px-3 py-1 rounded-lg bg-gray-800 text-gray-400 border border-gray-700"
                  >
                    {subj}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content grid: breakdown + add review */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Rating breakdown */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Rating Breakdown
          </h2>
          {reviewData?.breakdown ? (
            <RatingBreakdown breakdown={reviewData.breakdown} />
          ) : (
            <p className="text-sm text-gray-500">No reviews yet</p>
          )}
        </div>

        {/* Add review section */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Rate This Professor</h2>
          </div>
          {!showForm ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 mb-4">
                Had this professor? Share your experience anonymously.
              </p>
              <button
                onClick={() => {
                  if (!isAuthenticated()) {
                    window.location.href = `/login?redirect=/professor/${id}`;
                  } else {
                    setShowForm(true);
                  }
                }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
              >
                Write a Review
              </button>
            </div>
          ) : (
            <AddReviewForm
              professorId={id}
              onReviewAdded={handleReviewAdded}
            />
          )}
        </div>
      </div>

      {/* Reviews list */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          Reviews ({reviewData?.totalReviews || 0})
        </h2>
        {reviewData?.reviews && reviewData.reviews.length > 0 ? (
          <div className="space-y-4">
            {reviewData.reviews.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-10 text-center">
            <p className="text-gray-500">
              No reviews yet. Be the first to review!
            </p>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-600 italic">
          ⚠️ All reviews are anonymous student opinions and do not represent official evaluations.
        </p>
      </div>
    </div>
  );
}
