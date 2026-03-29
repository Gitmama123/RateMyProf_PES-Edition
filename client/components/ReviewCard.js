"use client";

import TagBadge from "./TagBadge";

// ReviewCard – displays a single anonymous review
export default function ReviewCard({ review }) {
  const {
    rating,
    teachingQuality,
    difficulty,
    gradingStrictness,
    attendanceStrictness,
    reviewText,
    tags,
    createdAt,
  } = review;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
      {/* Header row with overall rating and date */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Anonymous avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-500/20 flex items-center justify-center">
            <span className="text-xs text-indigo-300">A</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-300">Anonymous Student</p>
            <p className="text-xs text-gray-600">{formatDate(createdAt)}</p>
          </div>
        </div>
        {/* Rating badge */}
        <div
          className={`px-3 py-1 rounded-lg text-sm font-bold ${
            rating >= 4
              ? "bg-emerald-500/20 text-emerald-400"
              : rating >= 3
              ? "bg-amber-500/20 text-amber-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {rating}/5
        </div>
      </div>

      {/* Mini rating breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {[
          { label: "Teaching", value: teachingQuality },
          { label: "Difficulty", value: difficulty },
          { label: "Grading", value: gradingStrictness },
          { label: "Attendance", value: attendanceStrictness },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-gray-800/50 rounded-lg px-3 py-2 text-center"
          >
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">
              {label}
            </p>
            <p className="text-sm font-semibold text-gray-300">{value}/5</p>
          </div>
        ))}
      </div>

      {/* Review text */}
      {reviewText && (
        <p className="text-sm text-gray-400 leading-relaxed mb-3">
          &ldquo;{reviewText}&rdquo;
        </p>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}
    </div>
  );
}
