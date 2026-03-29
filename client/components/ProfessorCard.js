"use client";

import Link from "next/link";
import StarRating from "./StarRating";

// ProfessorCard – card component shown on the home page grid
export default function ProfessorCard({ professor }) {
  const {
    _id,
    name,
    department,
    campus,
    subjects,
    averageRating,
    totalReviews,
  } = professor;

  return (
    <Link href={`/professor/${_id}`}>
      <div className="group relative bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-indigo-500/50 hover:bg-gray-900/80 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 cursor-pointer">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors">
                {name}
              </h3>
              <p className="text-sm text-gray-400 mt-0.5">
                {department}{campus && campus !== "Unknown" ? `, ${campus}` : ""}
              </p>
            </div>
            {/* Rating badge */}
            <div className="flex-shrink-0 ml-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                  averageRating >= 4
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : averageRating >= 3
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : averageRating > 0
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-gray-700/50 text-gray-500 border border-gray-600"
                }`}
              >
                {averageRating > 0 ? averageRating.toFixed(1) : "–"}
              </div>
            </div>
          </div>

          {/* Stars */}
          <div className="flex items-center gap-2 mb-3">
            <StarRating rating={averageRating} size="text-base" />
            <span className="text-xs text-gray-500">
              {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
            </span>
          </div>

          {/* Subjects */}
          {subjects && subjects.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {subjects.slice(0, 3).map((subj) => (
                <span
                  key={subj}
                  className="text-xs px-2 py-0.5 rounded-md bg-gray-800 text-gray-400 border border-gray-700"
                >
                  {subj}
                </span>
              ))}
              {subjects.length > 3 && (
                <span className="text-xs px-2 py-0.5 text-gray-500">
                  +{subjects.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
