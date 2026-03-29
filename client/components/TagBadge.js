"use client";

// TagBadge – styled pill for review tags
const TAG_COLORS = {
  chill: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  strict: "bg-red-500/20 text-red-400 border-red-500/30",
  "slides reader": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "easy grader": "bg-green-500/20 text-green-400 border-green-500/30",
  "tough grader": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  inspiring: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  boring: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  helpful: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "attendance mandatory": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "gives notes": "bg-teal-500/20 text-teal-400 border-teal-500/30",
  "no attendance": "bg-lime-500/20 text-lime-400 border-lime-500/30",
  "practical focused": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
};

const DEFAULT_COLOR = "bg-slate-500/20 text-slate-400 border-slate-500/30";

export default function TagBadge({ tag, selected, onClick }) {
  const colorClass = TAG_COLORS[tag] || DEFAULT_COLOR;
  const baseClasses = `inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={() => onClick(tag)}
        className={`${baseClasses} cursor-pointer hover:scale-105 ${
          selected
            ? colorClass + " ring-1 ring-white/20"
            : "bg-gray-800/50 text-gray-500 border-gray-700 hover:border-gray-500"
        }`}
      >
        {tag}
      </button>
    );
  }

  return <span className={`${baseClasses} ${colorClass}`}>{tag}</span>;
}

// Export available tags for the form
export const AVAILABLE_TAGS = [
  "chill",
  "strict",
  "slides reader",
  "easy grader",
  "tough grader",
  "inspiring",
  "boring",
  "helpful",
  "attendance mandatory",
  "gives notes",
  "no attendance",
  "practical focused",
];
