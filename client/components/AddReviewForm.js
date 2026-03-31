"use client";

import { useState } from "react";
import TagBadge, { AVAILABLE_TAGS } from "./TagBadge";
import { submitReview } from "../lib/api";
import { getToken, isAuthenticated, getUser, isAdmin } from "../lib/auth";
import Link from "next/link";

// AddReviewForm – form to submit an anonymous review for a professor
export default function AddReviewForm({ professorId, professorName, onReviewAdded }) {
  const [formData, setFormData] = useState({
    rating: 3,
    teachingQuality: 3,
    difficulty: 3,
    gradingStrictness: 3,
    attendanceStrictness: 3,
    reviewText: "",
    tags: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSliderChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: parseInt(value) }));
  };

  const toggleTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);

    try {
      const token = getToken();
      const payload = { ...formData, rating: parseFloat(computedRating), professorId };
      await submitReview(payload, token);
      setSuccess(true);
      setFormData({
        rating: 3,
        teachingQuality: 3,
        difficulty: 3,
        gradingStrictness: 3,
        attendanceStrictness: 3,
        reviewText: "",
        tags: [],
      });
      if (onReviewAdded) onReviewAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const sliderFields = [
    { key: "teachingQuality", label: "Teaching Quality (1: Poor, 5: Excellent)", color: "accent-cyan-500" },
    { key: "difficulty", label: "Ease of Course (1: Hard, 5: Easy)", color: "accent-orange-500" },
    { key: "gradingStrictness", label: "Grading (1: Very Strict, 5: Fair/Lax)", color: "accent-amber-500" },
    { key: "attendanceStrictness", label: "Attendance (1: Strict, 5: Lenient)", color: "accent-pink-500" },
  ];

  const computedRating = ((formData.teachingQuality + formData.difficulty + formData.gradingStrictness + formData.attendanceStrictness) / 4).toFixed(1);

  // ─── ACADEMIC VERIFICATION CHECK ───
  // (Bypassed by user request: allow all students to rate all professors)
  const user = getUser();
  const isStudent = user && user.role === "student";

  if (!isAuthenticated()) {
    return (
      <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-8 text-center space-y-4">
        <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white">Verification Required</h3>
        <p className="text-gray-400 text-sm max-w-xs mx-auto">
          To ensure honest and high-quality reviews, only verified PES University students can rate professors.
        </p>
        <Link 
          href={`/login?redirect=${typeof window !== 'undefined' ? encodeURIComponent(window.location.pathname) : ''}`}
          className="inline-block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
        >
          Sign In with PESU Academy
        </Link>
        <p className="text-[10px] text-gray-600 italic mt-4">
          Your identity remains 100% anonymous through cryptographic hashing.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating sliders */}
      <div className="space-y-5">
        <div className="flex items-center justify-between mb-2 bg-indigo-500/10 px-5 py-4 rounded-xl border border-indigo-500/20">
          <span className="text-indigo-200 font-medium">Overall Rating (Calculated)</span>
          <span className="text-2xl font-bold text-indigo-400">
            {computedRating}/5
          </span>
        </div>
        {sliderFields.map(({ key, label, color }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">
                {label}
              </label>
              <span className="text-lg font-bold text-white min-w-[2rem] text-right">
                {formData[key]}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={formData[key]}
              onChange={(e) => handleSliderChange(key, e.target.value)}
              className={`w-full h-2 rounded-full bg-gray-700 appearance-none cursor-pointer ${color}`}
            />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-gray-600">1</span>
              <span className="text-[10px] text-gray-600">2</span>
              <span className="text-[10px] text-gray-600">3</span>
              <span className="text-[10px] text-gray-600">4</span>
              <span className="text-[10px] text-gray-600">5</span>
            </div>
          </div>
        ))}
      </div>

      {/* Review text */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">
            Review (Optional)
          </label>
          <span
            className={`text-xs ${
              formData.reviewText.length > 280
                ? "text-red-400"
                : "text-gray-600"
            }`}
          >
            {formData.reviewText.length}/300
          </span>
        </div>
        <textarea
          value={formData.reviewText}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              reviewText: e.target.value.slice(0, 300),
            }))
          }
          placeholder="Share your experience with this professor..."
          rows={3}
          className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 resize-none transition-colors"
        />
      </div>

      {/* Tag selection */}
      <div>
        <label className="text-sm font-medium text-gray-300 block mb-3">
          Tags (select all that apply)
        </label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_TAGS.map((tag) => (
            <TagBadge
              key={tag}
              tag={tag}
              selected={formData.tags.includes(tag)}
              onClick={toggleTag}
            />
          ))}
        </div>
      </div>

      {/* Error / Success messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3 text-sm text-emerald-400">
          Review submitted successfully! 🎉
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>

      {/* Disclaimer */}
      <p className="text-xs text-gray-600 text-center italic">
        Your review is completely anonymous. Be respectful and constructive.
      </p>
    </form>
  );
}
