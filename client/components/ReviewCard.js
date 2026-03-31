"use client";

import { useState } from "react";
import TagBadge from "./TagBadge";
import EditReviewForm from "./EditReviewForm";
import { isAdmin, getToken } from "../lib/auth";
import { deleteReview } from "../lib/api";

// ReviewCard – displays a single anonymous review
export default function ReviewCard({ review, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    _id,
    rating,
    teachingQuality,
    difficulty,
    gradingStrictness,
    attendanceStrictness,
    reviewText,
    tags,
    createdAt,
    canEdit, // Injected by backend
  } = review;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const token = getToken();
      await deleteReview(_id, token);
      if (onUpdate) onUpdate();
    } catch (err) {
      alert("Failed to delete review: " + err.message);
      setIsDeleting(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-gray-900/80 border-2 border-indigo-500/50 rounded-xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
          Edit Your Review
        </h3>
        <EditReviewForm 
          review={review} 
          onReviewUpdated={() => {
            setIsEditing(false);
            if (onUpdate) onUpdate();
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="group bg-gray-900/50 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all duration-300 relative overflow-hidden">
      {/* Admin/User Controls (Floating on hover) */}
      <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {canEdit && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 transition-colors"
            title="Edit Review"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
        {isAdmin() && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors disabled:opacity-50"
            title="Delete Review (Admin)"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Header row with overall rating and date */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Anonymous avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-500/20 flex items-center justify-center">
            <span className="text-xs text-indigo-300">A</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              Anonymous Student {canEdit && <span className="text-[10px] ml-1.5 px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md border border-indigo-500/20 font-bold uppercase tracking-wider">You</span>}
            </p>
            <p className="text-xs text-gray-600">{formatDate(createdAt)}</p>
          </div>
        </div>
        {/* Rating badge */}
        <div
          className={`px-3 py-1 rounded-lg text-sm font-black ${
            rating >= 4
              ? "bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]"
              : rating >= 3
              ? "bg-amber-500/20 text-amber-400"
              : "bg-red-500/20 text-red-400 shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)]"
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
            className="bg-gray-800/40 rounded-lg px-3 py-2 text-center border border-gray-800/50"
          >
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
              {label}
            </p>
            <p className="text-sm font-semibold text-gray-200">{value}/5</p>
          </div>
        ))}
      </div>

      {/* Review text */}
      {reviewText && (
        <div className="relative">
          <svg className="absolute -top-1 -left-1 w-4 h-4 text-gray-800 opacity-50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C20.1216 16 21.017 16.8954 21.017 18V21C21.017 22.1046 20.1216 23 19.017 23H16.017C14.9124 23 14.017 22.1046 14.017 21ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91198 16 7.0166 16H10.0166C11.1212 16 12.0166 16.8954 12.0166 18V21C12.0166 22.1046 11.1212 23 10.0166 23H7.0166C5.91198 23 5.0166 22.1046 5.0166 21ZM5.0166 9V12H10.0166C11.1212 12 12.0166 11.1046 12.0166 10V3C12.0166 1.89543 11.1212 1 10.0166 1H7.0166C5.91198 1 5.0166 1.89543 5.0166 3V6H3.0166V3C3.0166 0.790861 4.79326 -1 7.00244 -1H10.0308C12.24 -1 14.0166 0.790861 14.0166 3V10C14.0166 12.2091 12.24 14 10.0308 14H5.0166V9ZM14.017 9V12H19.017C20.1216 12 21.017 11.1046 21.017 10V3C21.017 1.89543 20.1216 1 19.017 1H16.017C14.9124 1 14.017 1.89543 14.017 3V6H12.017V3C12.017 0.790861 13.7937 -1 16.0028 -1H19.0312C21.2404 -1 23.017 0.790861 23.017 3V10C23.017 12.2091 21.2404 14 19.0312 14H14.017V9Z" />
          </svg>
          <p className="text-sm text-gray-400 leading-relaxed mb-3 pl-4 italic">
            &ldquo;{reviewText}&rdquo;
          </p>
        </div>
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
