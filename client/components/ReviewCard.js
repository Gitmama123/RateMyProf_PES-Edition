"use client";

import { useState } from "react";
import TagBadge from "./TagBadge";
import EditReviewForm from "./EditReviewForm";
import { isAdmin, getToken } from "../lib/auth";
import { deleteReview } from "../lib/api";

export default function ReviewCard({ review, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    _id, rating, teachingQuality, difficulty,
    gradingStrictness, attendanceStrictness,
    reviewText, tags, createdAt, canEdit, sentimentLabel,
  } = review;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });

  const handleDelete = async () => {
    if (!window.confirm("Delete this review? This cannot be undone.")) return;
    setIsDeleting(true);
    try {
      await deleteReview(_id, getToken());
      if (onUpdate) onUpdate();
    } catch (err) {
      alert("Failed to delete: " + err.message);
      setIsDeleting(false);
    }
  };

  // Theme-adaptive rating colors
  const ratingColor  = rating >= 4 ? "var(--green-text)" : rating >= 3 ? "var(--amber-text)" : "var(--red-text)";
  const ratingBg     = rating >= 4 ? "var(--green-bg)"   : rating >= 3 ? "var(--amber-bg)"   : "var(--red-bg)";
  const ratingBorder = rating >= 4 ? "var(--green-border)": rating >= 3 ? "var(--amber-border)": "var(--red-border)";

  const miniFields = [
    { label: "Teaching",   value: teachingQuality },
    { label: "Ease",       value: difficulty },
    { label: "Grading",    value: gradingStrictness },
    { label: "Attendance", value: attendanceStrictness },
  ];

  if (isEditing) {
    return (
      <div className="rounded-xl p-6 editorial-shadow"
        style={{ background: "var(--surface)", border: "2px solid var(--accent-border)" }}>
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text)" }}>
          <svg className="w-4 h-4" style={{ color: "var(--accent)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Your Review
        </h3>
        <EditReviewForm
          review={review}
          onReviewUpdated={() => { setIsEditing(false); if (onUpdate) onUpdate(); }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <article
      className="group rounded-xl p-5 transition-all duration-200 relative editorial-shadow"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "var(--accent-border)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Admin/user controls */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {canEdit && (
          <button onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-lg cursor-pointer transition-colors"
            style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)", color: "var(--accent)" }}
            title="Edit">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
        {isAdmin() && (
          <button onClick={handleDelete} disabled={isDeleting}
            className="p-1.5 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
            style={{ background: "var(--red-bg)", border: "1px solid var(--red-border)", color: "var(--red-text)" }}
            title="Delete (Admin)">
            {isDeleting
              ? <div className="w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--red-text)" }} />
              : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            }
          </button>
        )}
      </div>

      {/* Header row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Rating column */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0 min-w-[72px]">
          <div className="w-14 h-14 rounded-lg flex items-center justify-center text-[22px] font-black"
            style={{ background: ratingBg, color: ratingColor, border: `1px solid ${ratingBorder}` }}>
            {rating}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--subtle)" }}>Quality</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Reviewer + date */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--subtle)" }}>
                A
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                  Anonymous Student{" "}
                  {canEdit && (
                    <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
                      style={{ background: "var(--accent-bg)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}>
                      You
                    </span>
                  )}
                </p>
                <p className="text-[11px]" style={{ color: "var(--subtle)" }}>{formatDate(createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Mini breakdown chips */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {miniFields.map(({ label, value }) => (
              <div key={label} className="rounded-lg px-2 py-2 text-center"
                style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
                <p className="text-[9px] uppercase tracking-widest font-bold mb-0.5" style={{ color: "var(--subtle)" }}>
                  {label}
                </p>
                <p className="text-xs font-semibold" style={{ color: "var(--muted)" }}>{value}/5</p>
              </div>
            ))}
          </div>

          {/* Review text */}
          {reviewText && (
            <div className="mb-4">
              <p className="text-sm leading-relaxed italic pl-3"
                style={{ color: "var(--muted)", borderLeft: "2px solid var(--border2)" }}>
                "{reviewText}"
              </p>
              {sentimentLabel && (
                <div className="flex justify-end mt-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{
                      background: (sentimentLabel || "").toLowerCase() === "positive" ? "var(--green-bg)"
                                : (sentimentLabel || "").toLowerCase() === "negative" ? "var(--red-bg)"
                                : "var(--surface2)",
                      color: (sentimentLabel || "").toLowerCase() === "positive" ? "var(--green-text)"
                           : (sentimentLabel || "").toLowerCase() === "negative" ? "var(--red-text)"
                           : "var(--subtle)",
                      border: `1px solid ${(sentimentLabel || "").toLowerCase() === "positive" ? "var(--green-border)"
                                         : (sentimentLabel || "").toLowerCase() === "negative" ? "var(--red-border)"
                                         : "var(--border)"}`,
                    }}>
                    {(sentimentLabel || "").toLowerCase() === "positive" ? "😊" : (sentimentLabel || "").toLowerCase() === "negative" ? "😞" : "😐"} {sentimentLabel}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map(tag => <TagBadge key={tag} tag={tag} />)}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
