"use client";

import { useState } from "react";
import TagBadge, { AVAILABLE_TAGS } from "./TagBadge";
import { updateReview } from "../lib/api";
import { getToken } from "../lib/auth";

export default function EditReviewForm({ review, onReviewUpdated, onCancel }) {
  const [formData, setFormData] = useState({
    rating: review.rating,
    teachingQuality: review.teachingQuality,
    difficulty: review.difficulty,
    gradingStrictness: review.gradingStrictness,
    attendanceStrictness: review.attendanceStrictness,
    reviewText: review.reviewText || "",
    tags: review.tags || [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
    setSubmitting(true);

    try {
      const token = getToken();
      const payload = { ...formData, rating: parseFloat(computedRating) };
      await updateReview(review._id, payload, token);
      if (onReviewUpdated) onReviewUpdated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const sliderFields = [
    { key: "teachingQuality", label: "Teaching Quality", color: "accent-cyan-500" },
    { key: "difficulty", label: "Difficulty", color: "accent-orange-500" },
    { key: "gradingStrictness", label: "Grading Strictness", color: "accent-amber-500" },
    { key: "attendanceStrictness", label: "Attendance Strictness", color: "accent-pink-500" },
  ];

  const computedRating = ((formData.teachingQuality + formData.difficulty + formData.gradingStrictness + formData.attendanceStrictness) / 4).toFixed(1);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-5">
        <div className="flex items-center justify-between mb-2 bg-indigo-500/10 px-5 py-4 rounded-xl border border-indigo-500/20">
          <span className="text-indigo-200 font-medium">Updated Overall Rating</span>
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
          </div>
        ))}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-300 block mb-2">
          Review (Optional)
        </label>
        <textarea
          value={formData.reviewText}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              reviewText: e.target.value.slice(0, 300),
            }))
          }
          placeholder="Update your experience..."
          rows={3}
          className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none transition-colors"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-300 block mb-3">
          Tags
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

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 px-10 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg"
        >
          {submitting ? "Updating..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
