"use client";

import { useState } from "react";
import TagBadge, { AVAILABLE_TAGS } from "./TagBadge";
import { submitReview } from "../lib/api";

// AddReviewForm – form to submit an anonymous review for a professor
export default function AddReviewForm({ professorId, onReviewAdded }) {
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
      await submitReview({ ...formData, professorId });
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
    { key: "rating", label: "Overall Rating", color: "accent-indigo-500" },
    { key: "teachingQuality", label: "Teaching Quality", color: "accent-cyan-500" },
    { key: "difficulty", label: "Difficulty", color: "accent-orange-500" },
    { key: "gradingStrictness", label: "Grading Strictness", color: "accent-amber-500" },
    { key: "attendanceStrictness", label: "Attendance Strictness", color: "accent-pink-500" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating sliders */}
      <div className="space-y-5">
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
